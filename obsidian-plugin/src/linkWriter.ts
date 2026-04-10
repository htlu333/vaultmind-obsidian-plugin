import { App, TFile } from 'obsidian';
import VaultMindPlugin from '../main';

export async function writeBodyLinks(app: App, file: TFile, relatedNotes: string[], plugin: VaultMindPlugin) {
	if (!plugin.settings.enableBodyLinks || relatedNotes.length === 0) return;

	const content = await app.vault.read(file);
	const sectionTitle = '## 相关笔记';
	const maxLinks = plugin.settings.maxLinksPerNote || 3;
	const linksToWrite = relatedNotes.slice(0, maxLinks).map(note => `- [[${note}]]`).join('\n');

	const newSection = `\n\n${sectionTitle}\n${linksToWrite}\n`;

	// Check if section already exists
	const sectionRegex = new RegExp(`${sectionTitle}[\\s\\S]*?(?=\\n#|$)`, 'g');
	
	let newContent: string;
	if (sectionRegex.test(content)) {
		newContent = content.replace(sectionRegex, `${sectionTitle}\n${linksToWrite}`);
	} else {
		newContent = content.trimEnd() + newSection;
	}

	await app.vault.modify(file, newContent);
}
