# VaultMind Obsidian Plugin (MVP)

VaultMind is an LLM-powered knowledge organization assistant that helps you summarize and tag your notes automatically using DeepSeek API.

## Features

- **Automatic Analysis**: Summarize and tag notes with a single command.
- **Source Type Detection**: Automatically identifies if a note is a general note, an academic paper, or an excerpt.
- **DeepSeek Integration**: Direct connection to DeepSeek API for high-quality analysis.
- **Preview Before Write**: Review suggested metadata before it's added to your note.
- **Auto-Write Mode**: Skip confirmation for a faster workflow.

## Installation (Manual)

Since this is an MVP, you can install it manually in your vault:

1. Create a folder named `vaultmind` in your vault's `.obsidian/plugins/` directory.
2. Copy the following files into that folder:
   - `main.js` (generated after build)
   - `manifest.json`
   - `styles.css`
3. Restart Obsidian or reload plugins.
4. Enable **VaultMind** in the Community Plugins settings.

## Development & Build

If you want to build the plugin from source:

1. Navigate to the `obsidian-plugin` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
   This will generate `main.js` in the root of `obsidian-plugin`.

## Configuration

Go to Obsidian Settings -> VaultMind:

1. **DeepSeek API Key**: Enter your API key.
2. **Base URL**: Default is `https://api.deepseek.com/v1`.
3. **Model**: Default is `deepseek-chat`.
4. **Auto Write**: Toggle this to skip the preview modal.

## Usage

1. Open any markdown note.
2. Open the Command Palette (`Ctrl+P` or `Cmd+P`).
3. Search for `VaultMind: Analyze current note` and press Enter.
4. Review the results in the preview modal and click **Apply to Note**.
