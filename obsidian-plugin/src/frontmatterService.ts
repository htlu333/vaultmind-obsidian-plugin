import { App, TFile } from 'obsidian';
import { VaultMindMetadata } from './types';
import VaultMindPlugin from '../main';

export async function writeMetadataToFrontmatter(app: App, file: TFile, metadata: VaultMindMetadata, plugin: VaultMindPlugin) {
	const prefix = plugin.settings.fieldPrefix || 'vm_';
	
	await app.fileManager.processFrontMatter(file, (fm) => {
		fm[`${prefix}summary`] = metadata.vm_summary;
		fm[`${prefix}content_tags`] = metadata.vm_content_tags;
		fm[`${prefix}file_tags`] = metadata.vm_file_tags;
		fm[`${prefix}source_type`] = metadata.vm_source_type;
		fm[`${prefix}status`] = 'processed';
		fm[`${prefix}processed_at`] = metadata.vm_processed_at;
		if (metadata.vm_related_notes) {
			fm[`${prefix}related_notes`] = metadata.vm_related_notes;
		}
		if (metadata.vm_suggested_folder) {
			fm[`${prefix}suggested_folder`] = metadata.vm_suggested_folder;
			fm[`${prefix}folder_status`] = metadata.vm_folder_status;
			fm[`${prefix}folder_confidence`] = metadata.vm_folder_confidence;
			fm[`${prefix}folder_reason`] = metadata.vm_folder_reason;
		}
	});
}
