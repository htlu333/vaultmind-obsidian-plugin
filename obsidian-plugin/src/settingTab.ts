import { App, PluginSettingTab, Setting } from 'obsidian';
import VaultMindPlugin from '../main';

export class VaultMindSettingTab extends PluginSettingTab {
	plugin: VaultMindPlugin;

	constructor(app: App, plugin: VaultMindPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'VaultMind Settings' });

		new Setting(containerEl)
			.setName('DeepSeek API Key')
			.setDesc('Your DeepSeek API key.')
			.addText(text => text
				.setPlaceholder('sk-...')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Base URL')
			.setDesc('API base URL for DeepSeek.')
			.addText(text => text
				.setPlaceholder('https://api.deepseek.com/v1')
				.setValue(this.plugin.settings.baseUrl)
				.onChange(async (value) => {
					this.plugin.settings.baseUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Model')
			.setDesc('Model name to use.')
			.addText(text => text
				.setPlaceholder('deepseek-chat')
				.setValue(this.plugin.settings.model)
				.onChange(async (value) => {
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto Write')
			.setDesc('Automatically write metadata back to the file without confirmation.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoWrite)
				.onChange(async (value) => {
					this.plugin.settings.autoWrite = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Field Prefix')
			.setDesc('Prefix for the metadata fields (default: vm_).')
			.addText(text => text
				.setPlaceholder('vm_')
				.setValue(this.plugin.settings.fieldPrefix)
				.onChange(async (value) => {
					this.plugin.settings.fieldPrefix = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Graph & Relations' });

		new Setting(containerEl)
			.setName('Enable Body Links')
			.setDesc('Write [[wikilinks]] to the end of the note for Graph View.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableBodyLinks)
				.onChange(async (value) => {
					this.plugin.settings.enableBodyLinks = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Enable MOC')
			.setDesc('Generate/Update Map of Content (MOC) pages.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableMoc)
				.onChange(async (value) => {
					this.plugin.settings.enableMoc = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Max Links Per Note')
			.setDesc('Maximum number of related links to write to each note.')
			.addSlider(slider => slider
				.setLimits(1, 10, 1)
				.setValue(this.plugin.settings.maxLinksPerNote)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxLinksPerNote = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('MOC Folder Path')
			.setDesc('Folder where MOC pages will be stored.')
			.addText(text => text
				.setPlaceholder('VaultMind/MOCs')
				.setValue(this.plugin.settings.mocFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.mocFolderPath = value;
					await this.plugin.saveSettings();
				}));
	}
}
