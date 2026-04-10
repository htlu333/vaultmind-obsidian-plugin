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
	mocFolderPath: 'VaultMind/MOCs'
}
