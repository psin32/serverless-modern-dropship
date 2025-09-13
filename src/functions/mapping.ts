import { gateway, MemoryStorageFactory } from "@elasticpath/js-sdk";
import type { ConfigOptions } from "@elasticpath/js-sdk";

export const handler = async (event: any) => {
  try {
    // Parse the request body
    const body: any = JSON.parse(event.body);

    if (!body.data || !Array.isArray(body.data)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "Invalid request body. Expected 'data' array with product information.",
        }),
      };
    }

    const config: ConfigOptions = {
      host: process.env.ELASTICPATH_HOST,
      client_id: process.env.ELASTICPATH_CLIENT_ID || "",
      client_secret: process.env.ELASTICPATH_CLIENT_SECRET || "",
      storage: new MemoryStorageFactory(),
    };

    const client = gateway(config);

    // Process all products and transform option values
    for (const product of body.data) {
      const companyId = product.companyId;

      // Extract all variant option values using JavaScript
      const options: string[] = [];
      for (const variant of product.variants) {
        for (const option of variant.options) {
          options.push(option.value);
        }
      }

      // Get unique option values for the API call
      const uniqueOptions = [...new Set(options)];

      // Fetch mapping data from ElasticPath
      let mappingData = null;
      if (uniqueOptions.length > 0) {
        try {
          const mapping = await client.request.send(
            `/extensions/mdmappings?filter=eq(company_id,${companyId}):in(vendor_option,${uniqueOptions.join(
              ","
            )}):eq(enabled,true)`,
            "GET",
            undefined,
            undefined,
            client,
            false,
            "v2"
          );
          mappingData = mapping.data;
        } catch (mappingError) {
          console.warn(
            `Could not fetch mapping data for company ${companyId}:`,
            mappingError
          );
        }
      }

      // Transform option values using JavaScript instead of JSONata
      if (mappingData && Array.isArray(mappingData)) {
        for (const variant of product.variants) {
          for (const option of variant.options) {
            const mapping = mappingData.find(
              (m: any) => m.vendor_option === option.value && m.enabled === true
            );
            if (mapping) {
              option.value = mapping.ep_option;
            }
          }
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(body),
    };
  } catch (error) {
    console.error("Error processing mapping request:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
    };
  }
};
