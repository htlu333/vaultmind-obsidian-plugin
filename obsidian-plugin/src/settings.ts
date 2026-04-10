export interface VaultMindSettings {
	apiKey: string;
	baseUrl: string;
	model: string;
	autoWrite: boolean;
	fieldPrefix: string;
	enableBodyLinks: boolean;
	enableMoc: boolean;
	maxLinksPerNote: number;
	mocFolderPath: string;
	tagAlignmentStrategy: 'off' | 'prefer_existing' | 'prefer_existing_and_autolink_moc';
}

export const DEFAULT_SETTINGS: VaultMindSettings = {
	apiKey: '',
	baseUrl: 'https://api.deepseek.com/v1',
	model: 'deepseek-chat',
	autoWrite: false,
	fieldPrefix: 'vm_',
	enableBodyLinks: true,
	enableMoc: true,
	maxLinksPerNote: 3,
	mocFolderPath: 'VaultMind/MOCs',
	tagAlignmentStrategy: 'prefer_existing_and_autolink_moc'
}
