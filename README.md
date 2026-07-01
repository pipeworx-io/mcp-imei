# mcp-imei

IMEI validation MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1140+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `validate_imei` | Validate an IMEI (15 digits, with Luhn check) or IMEISV (16 digits, no check). Keyless/offline. Returns validity and the parts: TAC (Type Allocation Code, first 8), serial number, and check digit. Spaces/dashes ignored. Validates the number, not the device. |
| `imei_check_digit` | Compute the Luhn check digit for the first 14 digits of an IMEI (use to complete or repair an IMEI). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "imei": {
      "url": "https://gateway.pipeworx.io/imei/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1140+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Imei data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
