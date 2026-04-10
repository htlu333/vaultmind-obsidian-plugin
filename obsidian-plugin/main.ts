import { Plugin, Notice, MarkdownView, TFolder, TFile } from 'obsidian';
import { VaultMindSettings, DEFAULT_SETTINGS } from './src/settings';
import { VaultMindSettingTab } from './src/settingTab';
import { analyzeCurrentNote, analyzeFolder } from './src/commands';
import { PreviewModal } from './src/previewModal';
import { writeMetadataToFrontmatter } from './src/frontmatterService';

export default class VaultMindPlugin extends Plugin {
	settings: VaultMindSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new VaultMindSettingTab(this.app, this));

		this.addCommand({
			id: 'analyze-current-note',
			name: 'Analyze current note',
			callback: async () => {
				const metadata = await analyzeCurrentNote(this.app, this);
				if (metadata) {
					const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
					if (activeView && activeView.file) {
						if (this.settings.autoWrite) {
							await writeMetadataToFrontmatter(this.app, activeView.file, metadata, this);
							new Notice('VaultMind: Metadata updated automatically.');
						} else {
							new PreviewModal(this.app, activeView.file, metadata, this, () => {
								new Notice('VaultMind: Metadata updated.');
							}).open();
						}
					}
				}
			}
		});

		this.addCommand({
			id: 'analyze-folder',
			name: 'Analyze notes in current folder',
			callback: async () => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!activeView || !activeView.file || !activeView.file.parent) {
					new Notice('No active folder found.');
					return;
				}
				const folder = activeView.file.parent;
				if (folder instanceof TFolder) {
					await analyzeFolder(this.app, this, folder);
				}
			}
		});

		console.log('loading VaultMind plugin');
	}

	async onunload() {
		console.log('unloading VaultMind plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
