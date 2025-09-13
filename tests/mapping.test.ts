import { handler } from "../src/functions/mapping";

// Mock the @elasticpath/js-sdk
jest.mock("@elasticpath/js-sdk", () => ({
  gateway: jest.fn(() => ({
    request: {
      send: jest.fn().mockResolvedValue({
        data: [
          {
            company_id: "688398a3bd881f7d602ca525",
            enabled: true,
            ep_option: "xs",
            vendor_option: "extra-small",
          },
        ],
      }),
    },
  })),
}));

// No need to mock jsonata anymore since we removed it

describe("mapping function", () => {
  const mockProductData = {
    data: [
      {
        id: "688a9e30bd881f7d608a020b",
        title: "Striped Skirt and Top New",
        description: "Black cotton top with matching striped skirt.",
        brand: "Modern Dropship Apparel",
        companyId: "688398a3bd881f7d602ca525",
        sellerReference: "striped-skirt-and-top-new",
        tags: ["women"],
        images: [
          {
            id: "688a9e30bd881f7d608a0210",
            position: 1,
            source:
              "https://cdn.shopify.com/s/files/1/0018/5617/6150/products/woman-in-the-city_925x_34c54a7d-e2a0-48fe-a169-fde33a735aef.jpg",
            variantIds: ["688a9e30bd881f7d608a020e"],
          },
        ],
        variants: [
          {
            id: "688a9e30bd881f7d608a020c",
            sku: "striped-skirt-and-top-new-extra-small",
            title: "Striped Skirt And Top New - Extra Small",
            basePrice: 52.3,
            retailPrice: 78,
            inventoryAmount: 2,
            weight: 471,
            weightUnits: "g",
            options: [{ name: "Size", value: "extra-small" }],
          },
        ],
        created: "2025-07-30T22:35:28.22Z",
        updated: "2025-07-30T22:36:25.618Z",
      },
    ],
  };

  it("should process product data successfully", async () => {
    const event = {
      body: JSON.stringify(mockProductData),
      httpMethod: "POST",
      headers: { "Content-Type": "application/json" },
    };

    const result = await handler(event);

    expect(result).toHaveProperty("statusCode", 200);
    expect(result).toHaveProperty("body");
    expect(() => JSON.parse(result.body)).not.toThrow();

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(1);

    // Check that the transformation was applied
    const product = body.data[0];
    expect(product).toHaveProperty("variants");
    expect(product.variants[0]).toHaveProperty("options");

    // Check that options were transformed (mapped from vendor to EP options)
    const option = product.variants[0].options[0];
    expect(option).toHaveProperty("value");
    expect(option.value).toBe("xs"); // Should be transformed from "extra-small"
  });

  it("should handle invalid request body", async () => {
    const event = {
      body: JSON.stringify({ invalid: "data" }),
      httpMethod: "POST",
      headers: { "Content-Type": "application/json" },
    };

    const result = await handler(event);

    expect(result).toHaveProperty("statusCode", 400);
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty("error");
  });

  it("should handle malformed JSON", async () => {
    const event = {
      body: "invalid json",
      httpMethod: "POST",
      headers: { "Content-Type": "application/json" },
    };

    const result = await handler(event);

    expect(result).toHaveProperty("statusCode", 500);
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty("success", false);
  });
});
