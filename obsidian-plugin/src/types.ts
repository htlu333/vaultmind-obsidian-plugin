export enum SourceType {
	NOTE = "note",
	PAPER = "paper",
	EXCERPT = "excerpt"
}

export interface VaultMindMetadata {
	[key: string]: any;
	vm_summary: string;
	vm_content_tags: string[];
	vm_file_tags: string[];
	vm_source_type: SourceType;
	vm_status: string;
	vm_processed_at: string;
	vm_related_notes?: string[];
	vm_suggested_folder?: string;
	vm_folder_status?: 'matched' | 'suggested_new';
	vm_folder_confidence?: 'high' | 'medium' | 'low';
	vm_folder_reason?: string;
}
