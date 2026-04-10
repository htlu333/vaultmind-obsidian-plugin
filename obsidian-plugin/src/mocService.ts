import { App, TFile, TFolder, Notice } from 'obsidian';
import VaultMindPlugin from '../main';

export async function updateMocPage(app: App, topic: string, noteTitle: string, plugin: VaultMindPlugin) {
	if (!plugin.settings.enableMoc || !topic) return;

	const mocFolder = plugin.settings.mocFolderPath || 'VaultMind/MOCs';
	const mocPath = `${mocFolder}/${topic}.md`;

	// Ensure folder exists
	await ensureFolderExists(app, mocFolder);

	let mocFile = app.vault.getAbstractFileByPath(mocPath);
	let content = '';

	if (mocFile instanceof TFile) {
		content = await app.vault.read(mocFile);
	} else {
		content = `# ${topic}\n\n## 相关笔记\n`;
	}

	const link = `- [[${noteTitle}]]`;
	if (!content.includes(`[[${noteTitle}]]`)) {
		const sectionTitle = '## 相关笔记';
		if (content.includes(sectionTitle)) {
			content = content.replace(sectionTitle, `${sectionTitle}\n${link}`);
		} else {
			content += `\n${sectionTitle}\n${link}\n`;
		}
		
		if (mocFile instanceof TFile) {
			await app.vault.modify(mocFile, content);
		} else {
			await app.vault.create(mocPath, content);
		}
	}
}

async function ensureFolderExists(app: App, path: string) {
	const parts = path.split('/');
	let currentPath = '';
	for (const part of parts) {
		currentPath += (currentPath ? '/' : '') + part;
		const folder = app.vault.getAbstractFileByPath(currentPath);
		if (!folder) {
			await app.vault.createFolder(currentPath);
		}
	}
}
