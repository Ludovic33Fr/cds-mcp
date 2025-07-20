#!/usr/bin/env node
import { program } from 'commander';
import { getBestDeliveryInformations } from './mcp.js';
program
    .command('best-delivery')
    .description('Get best delivery info for a product')
    .requiredOption('--productId <id>', 'Product ID')
    .requiredOption('--offerId <id>', 'Offer ID')
    .requiredOption('--postalCode <code>', 'Postal code')
    .requiredOption('--longitude <lng>', 'Longitude', parseFloat)
    .requiredOption('--latitude <lat>', 'Latitude', parseFloat)
    .requiredOption('--city <city>', 'City')
    .requiredOption('--country <code>', 'Country code')
    .action(async (opts) => {
    const result = await getBestDeliveryInformations(opts.productId, opts.offerId, opts.postalCode, opts.longitude, opts.latitude, opts.city, opts.country);
    console.log(result);
});
program.parse(process.argv);
