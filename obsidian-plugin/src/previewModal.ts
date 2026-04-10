import { App, Modal, Setting, TFile } from 'obsidian';
import { VaultMindMetadata } from './types';
import { writeMetadataToFrontmatter } from './frontmatterService';
import VaultMindPlugin from '../main';

export class PreviewModal extends Modal {
	metadata: VaultMindMetadata;
	file: TFile;
	plugin: VaultMindPlugin;
	onConfirm: () => void;

	constructor(app: App, file: TFile, metadata: VaultMindMetadata, plugin: VaultMindPlugin, onConfirm: () => void) {
		super(app);
		this.file = file;
		this.metadata = metadata;
		this.plugin = plugin;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'VaultMind Analysis Preview' });

		contentEl.createEl('p', { text: 'Review the generated metadata before writing it to the note.' });

		const previewContainer = contentEl.createDiv({ cls: 'vaultmind-preview-container' });

		this.createPreviewRow(previewContainer, 'Summary', this.metadata.vm_summary);
		this.createPreviewRow(previewContainer, 'Content Tags', this.metadata.vm_content_tags.join(', '));
		this.createPreviewRow(previewContainer, 'File Tags', this.metadata.vm_file_tags.join(', '));
		this.createPreviewRow(previewContainer, 'Source Type', this.metadata.vm_source_type);
		if (this.metadata.vm_related_notes && this.metadata.vm_related_notes.length > 0) {
			this.createPreviewRow(previewContainer, 'Related Notes', this.metadata.vm_related_notes.join(', '));
		}
		if (this.metadata.vm_suggested_folder) {
			this.createPreviewRow(previewContainer, 'Suggested Folder', `${this.metadata.vm_suggested_folder} (${this.metadata.vm_folder_status})`);
			this.createPreviewRow(previewContainer, 'Folder Confidence', this.metadata.vm_folder_confidence || 'low');
		}

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Cancel')
				.onClick(() => {
					this.close();
				}))
			.addButton(btn => btn
				.setButtonText('Apply to Note')
				.setCta()
				.onClick(async () => {
					await writeMetadataToFrontmatter(this.app, this.file, this.metadata, this.plugin);
					this.onConfirm();
					this.close();
				}));
	}

	createPreviewRow(parent: HTMLElement, label: string, value: string) {
		const row = parent.createDiv({ cls: 'vaultmind-preview-row' });
		row.createEl('strong', { text: `${label}: ` });
		row.createEl('span', { text: value });
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
