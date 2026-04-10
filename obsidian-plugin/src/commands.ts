import { App, MarkdownView, Notice, TFile, TFolder } from 'obsidian';
import VaultMindPlugin from '../main';
import { detectSourceType, extractPaperMetadata } from './detectors';
import { buildExcerptPrompt, buildNotePrompt, buildPaperPrompt } from './promptBuilder';
import { callDeepSeek } from './deepseekClient';
import { SourceType, VaultMindMetadata } from './types';
import { writeMetadataToFrontmatter } from './frontmatterService';
import { writeBodyLinks } from './linkWriter';
import { updateMocPage } from './mocService';

type AnalyzedRecord = {
	file: TFile;
	metadata: VaultMindMetadata;
};

export async function analyzeCurrentNote(app: App, plugin: VaultMindPlugin): Promise<VaultMindMetadata | null> {
	const activeView = app.workspace.getActiveViewOfType(MarkdownView);
	if (!activeView) {
		new Notice('No active markdown note found.');
		return null;
	}

	const file = activeView.file;
	if (!file) return null;

	return analyzeFile(app, plugin, file);
}

export async function analyzeFolder(app: App, plugin: VaultMindPlugin, folder: TFolder) {
	const files = app.vault
		.getMarkdownFiles()
		.filter(file => folder.path ? file.path.startsWith(`${folder.path}/`) : true);

	if (files.length === 0) {
		new Notice('VaultMind: No markdown files found in the current folder.');
		return;
	}

	const prefix = plugin.settings.fieldPrefix || 'vm_';
	const records: AnalyzedRecord[] = [];
	let processedCount = 0;
	let skippedCount = 0;

	new Notice(`VaultMind: Starting batch analysis (Phase 1: Tagging) of ${files.length} files...`);

	for (const file of files) {
		const cache = app.metadataCache.getFileCache(file);
		const frontmatter = cache?.frontmatter || {};
		const status = frontmatter[`${prefix}status`];

		if (status === 'processed') {
			const existing = readRecordFromFrontmatter(file, frontmatter, prefix);
			if (existing) {
				records.push(existing);
			}
			skippedCount++;
			continue;
		}

		const metadata = await analyzeFile(app, plugin, file);
		if (metadata) {
			// Compute folder suggestion based on all records (including existing ones)
			const suggestion = computeFolderSuggestion(metadata, records, plugin);
			metadata.vm_suggested_folder = suggestion.folder;
			metadata.vm_folder_status = suggestion.status;
			metadata.vm_folder_confidence = suggestion.confidence;
			metadata.vm_folder_reason = suggestion.reason;

			await writeMetadataToFrontmatter(app, file, metadata, plugin);
			records.push({ file, metadata });
			processedCount++;
			await sleep(400);
		}
	}

	new Notice(`VaultMind: Phase 1 complete. Processed: ${processedCount}, Skipped: ${skippedCount}`);

	if (records.length === 0) {
		new Notice('VaultMind: No records available for linking.');
		return;
	}

	new Notice('VaultMind: Starting Phase 2 (Linking)...');
	const linkCount = await applyGraphRelations(app, plugin, records, prefix);
	new Notice(`VaultMind: Phase 2 complete. Links updated for ${linkCount} files.`);
}

export async function analyzeFile(app: App, plugin: VaultMindPlugin, file: TFile): Promise<VaultMindMetadata | null> {
	const content = await app.vault.read(file);
	const metadata = app.metadataCache.getFileCache(file)?.frontmatter || {};

	const sourceType = detectSourceType(content, metadata);

	let prompt = '';
	if (sourceType === SourceType.PAPER) {
		const extracted = extractPaperMetadata(content);
		prompt = buildPaperPrompt(content, extracted);
	} else if (sourceType === SourceType.EXCERPT) {
		prompt = buildExcerptPrompt(content);
	} else {
		prompt = buildNotePrompt(content);
	}

	new Notice(`Analyzing ${file.name} with DeepSeek...`);

	try {
		const llmResult = await callDeepSeek(prompt, plugin.settings);

		const validatedMetadata: VaultMindMetadata = {
			vm_summary: llmResult.vm_summary || 'No summary provided.',
			vm_content_tags: validateTags(llmResult.vm_content_tags || []),
			vm_file_tags: llmResult.vm_file_tags || [],
			vm_source_type: sourceType,
			vm_status: 'draft',
			vm_processed_at: new Date().toISOString(),
			vm_related_notes: llmResult.vm_related_notes || []
		};

		return validatedMetadata;
	} catch (error: any) {
		new Notice(`Error analyzing ${file.name}: ${error.message}`);
		console.error(error);
		return null;
	}
}

function validateTags(tags: string[]): string[] {
	const forbiddenWords = ['研究', '学习', '方法', '分析', '笔记', '思考', '问题'];
	return tags
		.map(tag => tag.trim())
		.filter(tag => tag.length >= 2 && tag.length <= 15) // 过滤过短或过长的
		.filter(tag => !forbiddenWords.includes(tag)) // 过滤过泛的
		.slice(0, 3); // 最多保留 3 个
}

async function applyGraphRelations(
	app: App,
	plugin: VaultMindPlugin,
	records: AnalyzedRecord[],
	prefix: string
): Promise<number> {
	let linkCount = 0;

	for (const record of records) {
		const relatedNotes = computeRelatedNotes(record, records, plugin.settings.maxLinksPerNote || 3);
		const primaryTopic = record.metadata.vm_content_tags[0] || record.metadata.vm_file_tags[0] || '';

		if (relatedNotes.length === 0 && !primaryTopic) {
			continue;
		}

		await app.fileManager.processFrontMatter(record.file, fm => {
			fm[`${prefix}related_notes`] = relatedNotes;
			fm[`${prefix}graph_links_written`] = relatedNotes.length > 0;
			if (primaryTopic) {
				fm[`${prefix}moc_pages`] = [primaryTopic];
			}
		});

		if (relatedNotes.length > 0) {
			await writeBodyLinks(app, record.file, relatedNotes, plugin);
		}

		if (primaryTopic) {
			await updateMocPage(app, primaryTopic, record.file.basename, plugin);
		}

		linkCount++;
		await sleep(200);
	}

	return linkCount;
}

function computeRelatedNotes(current: AnalyzedRecord, allRecords: AnalyzedRecord[], maxLinks: number): string[] {
	const scored = allRecords
		.filter(record => record.file.path !== current.file.path)
		.map(record => {
			const score = computeOverlapScore(current.metadata, record.metadata);
			return {
				title: record.file.basename,
				score,
				sameFolder: current.file.parent?.path === record.file.parent?.path
			};
		})
		.map(item => ({
			...item,
			score: item.score > 0 ? item.score : (item.sameFolder ? 1 : 0)
		}))
		.filter(item => item.score > 0)
		.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

	const related: string[] = [];
	for (const item of scored) {
		if (!related.includes(item.title)) {
			related.push(item.title);
		}
		if (related.length >= maxLinks) {
			break;
		}
	}

	return related;
}

function computeOverlapScore(left: VaultMindMetadata, right: VaultMindMetadata): number {
	const leftTags = new Set([...left.vm_content_tags, ...left.vm_file_tags]);
	const rightTags = new Set([...right.vm_content_tags, ...right.vm_file_tags]);
	let score = 0;

	for (const tag of leftTags) {
		if (rightTags.has(tag)) {
			score += 2;
		}
	}

	return score;
}

function readRecordFromFrontmatter(file: TFile, frontmatter: any, prefix: string): AnalyzedRecord | null {
	const contentTags = normalizeArray(frontmatter?.[`${prefix}content_tags`]);
	const fileTags = normalizeArray(frontmatter?.[`${prefix}file_tags`]);
	const sourceType = frontmatter?.[`${prefix}source_type`] || SourceType.NOTE;

	if (contentTags.length === 0 && fileTags.length === 0) {
		return null;
	}

	return {
		file,
		metadata: {
			vm_summary: String(frontmatter?.[`${prefix}summary`] || ''),
			vm_content_tags: contentTags,
			vm_file_tags: fileTags,
			vm_source_type: sourceType,
			vm_status: String(frontmatter?.[`${prefix}status`] || 'processed'),
			vm_processed_at: String(frontmatter?.[`${prefix}processed_at`] || new Date().toISOString()),
			vm_related_notes: normalizeArray(frontmatter?.[`${prefix}related_notes`])
		}
	};
}

function normalizeArray(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map(item => String(item).trim()).filter(Boolean);
	}

	if (typeof value === 'string') {
		return value
			.split(',')
			.map(item => item.trim())
			.filter(Boolean);
	}

	return [];
}

function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function computeFolderSuggestion(
	current: VaultMindMetadata,
	allRecords: AnalyzedRecord[],
	plugin: VaultMindPlugin
): { folder: string; status: 'matched' | 'suggested_new'; confidence: 'high' | 'medium' | 'low'; reason: string } {
	const folderScores: Record<string, number> = {};
	const folderCounts: Record<string, number> = {};

	for (const record of allRecords) {
		const folderPath = record.file.parent?.path || '';
		if (!folderPath || folderPath === '/') continue;

		const score = computeOverlapScore(current, record.metadata);
		folderScores[folderPath] = (folderScores[folderPath] || 0) + score;
		folderCounts[folderPath] = (folderCounts[folderPath] || 0) + 1;
	}

	let bestFolder = '';
	let maxScore = -1;

	for (const folder in folderScores) {
		const avgScore = folderScores[folder] / folderCounts[folder];
		if (avgScore > maxScore) {
			maxScore = avgScore;
			bestFolder = folder;
		}
	}

	if (bestFolder && maxScore >= 2) {
		return {
			folder: bestFolder,
			status: 'matched',
			confidence: maxScore >= 4 ? 'high' : 'medium',
			reason: `与该文件夹下文档标签重叠度高 (平均分: ${maxScore.toFixed(1)})`
		};
	}

	// Suggest new folder name based on primary tag
	const primaryTag = current.vm_content_tags[0] || current.vm_file_tags[0] || '未分类';
	const suggestedNew = `VaultMind/${primaryTag}`;

	return {
		folder: suggestedNew,
		status: 'suggested_new',
		confidence: 'low',
		reason: '未找到匹配的现有文件夹，根据主标签建议新目录'
	};
}
