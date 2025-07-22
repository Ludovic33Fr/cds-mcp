import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getBestDeliveryInformations, searchByKeyword, getProductDetails, authenticateOAuth } from './mcp.js';
// Create server instance
const server = new McpServer({
    name: "cdiscount-mcp",
    version: "1.0.0",
});
// Register CDiscount tools
server.tool("GetBestDeliveryInformations", "Get the best delivery information for a specific product and location from CDiscount. This method returns shipping details including free shipping status, delivery delays, and pricing information.", {
    productId: z.string().describe("The unique identifier of the product on CDiscount"),
    offerId: z.string().describe("The unique identifier of the specific offer for this product"),
    postalCode: z.string().describe("The postal code of the delivery address"),
    longitude: z.number().describe("The longitude coordinate of the delivery location (e.g., -0.7007206 for Paris)"),
    latitude: z.number().describe("The latitude coordinate of the delivery location (e.g., 44.8996853 for Paris)"),
    city: z.string().describe("The name of the city for delivery"),
    country: z.string().describe("The country code for delivery (e.g., FR for France, BE for Belgium)"),
}, async ({ productId, offerId, postalCode, longitude, latitude, city, country }) => {
    try {
        const result = await getBestDeliveryInformations(productId, offerId, postalCode, longitude, latitude, city, country);
        return {
            content: [
                {
                    type: "text",
                    text: result,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
        };
    }
});
server.tool("SearchByKeyWord", "Search for products on CDiscount using keywords. This method returns a list of products matching the search criteria with details including product name, price, rating, and availability.", {
    searchWord: z.string().describe("The keyword or search term to find products (e.g., 'smartphone', 'laptop', 'headphones')"),
}, async ({ searchWord }) => {
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
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
        };
    }
});
server.tool("GetProductDetails", "Get comprehensive product details from CDiscount including price, brand, description, ratings, shipping information, and technical specifications.", {
    productId: z.string().describe("The unique identifier of the product on CDiscount (e.g., 'aaalm03538')"),
}, async ({ productId }) => {
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
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
        };
    }
});
server.tool("AuthenticateOAuth", "Authenticate using OAuth2 flow with PKCE (Proof Key for Code Exchange) and return an authentication token. This method opens a browser for user login and handles the complete OAuth2 authorization flow securely.", {}, async () => {
    try {
        const clientId = "ftc78cbA5pb2cmjnHS23QAoU";
        const clientSecret = undefined;
        const redirectUri = "https://www.oauth.com/playground/authorization-code-with-pkce.html";
        const scope = "photo";
        const result = await authenticateOAuth(clientId, clientSecret, redirectUri, scope);
        return {
            content: [
                {
                    type: "text",
                    text: result,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                },
            ],
        };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("CDS MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
