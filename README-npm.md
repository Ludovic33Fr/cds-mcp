# @ludovic33fr/cds-mcp

MCP server for CDiscount API with OAuth2 authentication and product search capabilities.

## Installation

```bash
npm install @ludovic33fr/cds-mcp
```

## Usage

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cdiscount-mcp": {
      "command": "npx",
      "args": ["@ludovic33fr/cds-mcp"]
    }
  }
}
```

### Available Tools

- **SearchByKeyWord**: Search for products on CDiscount
- **GetProductDetails**: Get comprehensive product details
- **GetBestDeliveryInformations**: Get delivery information for products
- **AuthenticateOAuth**: OAuth2 authentication with PKCE

## Features

- 🔍 Product search on CDiscount
- 📦 Product details and specifications
- 🚚 Delivery information and pricing
- 🔐 OAuth2 authentication with PKCE
- 🌐 Cross-platform browser integration

## License

MIT 