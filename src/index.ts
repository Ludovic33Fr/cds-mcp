import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { 
  getBestDeliveryInformations, 
  searchByKeyword, 
  getProductDetails,
  authenticateOAuth 
} from './mcp.js';

// Create server instance
const server = new McpServer({
  name: "cdiscount-mcp",
  version: "1.0.0",
});

// Register CDiscount tools
server.tool(
  "GetBestDeliveryInformations",
  "Get the best delivery information.",
  {
    productId: z.string().describe("The id of the product"),
    offerId: z.string().describe("The id of the offer associated to the product"),
    postalCode: z.string().describe("The postal code for delivery"),
    longitude: z.number().describe("The longitude of the location to find the delivery information (like : -0.7007206)"),
    latitude: z.number().describe("The latitude of the location to find the delivery information (like : 44.8996853)"),
    city: z.string().describe("The name of the city to find the delivery information"),
    country: z.string().describe("The Code of the country to find the delivery information (like FR for France)"),
  },
  async ({ productId, offerId, postalCode, longitude, latitude, city, country }) => {
    try {
      const result = await getBestDeliveryInformations(
        productId,
        offerId,
        postalCode,
        longitude,
        latitude,
        city,
        country
      );
      
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "SearchByKeyWord",
  "Search a product by keyword.",
  {
    searchWord: z.string().describe("This parameter represent the key word for the search"),
  },
  async ({ searchWord }) => {
    try {
      const result = await searchByKeyword(searchWord);
      
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "GetProductDetails",
  "Get product details.",
  {
    productId: z.string().describe("The id of the product to get more details"),
  },
  async ({ productId }) => {
    try {
      const result = await getProductDetails(productId);
      
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "AuthenticateOAuth",
  "Authenticate using OAuth2 flow with PKCE and return an authentication token.",
  {
    clientId: z.string().describe("The OAuth client ID"),
    clientSecret: z.string().optional().describe("The OAuth client secret (optional for public clients)"),
    redirectUri: z.string().optional().describe("The redirect URI for OAuth callback"),
    scope: z.string().optional().describe("The OAuth scope"),
  },
  async ({ clientId, clientSecret, redirectUri, scope }) => {
    try {
      const result = await authenticateOAuth(clientId, clientSecret, redirectUri, scope);
      
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CDiscount MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 