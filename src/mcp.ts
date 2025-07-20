import { doRequest } from './http.js';

export async function getBestDeliveryInformations(
  productId: string,
  offerId: string,
  postalCode: string,
  longitude: number,
  latitude: number,
  city: string,
  country: string
): Promise<string> {
  const body = {
    productId,
    offerId,
    geoloc: { postalCode, longitude, latitude, city, country }
  };

  const headers = {
    'x-cds-context-devicetype': 'mobile',
    'x-cds-context-features': '{newTechnicalDescription=true}',
    'x-cds-context-pro-enabled': 'false',
    'x-cds-context-siteid': '206',
    'x-requested-with': 'XMLHttpRequest',
    'content-type': 'application/json'
  };

  const res = await doRequest('https://bffmobilesite.cdiscount.com/shipping/bestDeliveryInformation', {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  // const json = await res.body.json();
  const json = await res.body.json() as any;

  return `
Product ID      : ${json.productId}
Offer ID        : ${json.offerId}
Free Shipping   : ${json.isFreeShipping ? 'Oui' : 'Non'}
Delivery Msg    : ${json.shippingDelayMessage}
More Info       : ${json.detailUrl}
`.trim();
}

export async function searchByKeyword(searchWord: string): Promise<string> {
  const url = 'https://bffmobilesite.cdiscount.com/search?context=search';

  const body = {
    departmentId: '10',
    extendedPropertyKeys: ['DesactivateH1'],
    filterIds: ['navigation/"07/0703/070302"'],
    isDidYouMeanSelected: false,
    isQuickFacetsImageButtonActive: false,
    isRerankingSdxEnabled: null,
    isSwordEnabled: true,
    mediaSizes: [
      [140, 210],
      [140, 140],
      [300, 300]
    ],
    page: 2,
    pageType: 'SEARCH_AJAX',
    perPage: 47,
    searchWord,
    siteMapNodeId: null,
    sort: 'relevance',
    sortDir: 'desc',
    uniqueVisitId: '250616095109LVQBOXQV',
    url: `https://www.cdiscount.com/search/10/${encodeURIComponent(searchWord)}.html?page=2`
  };

  const headers = {
    'x-cds-context-devicetype': 'mobile',
    'x-cds-context-features': '{newTechnicalDescription=true}',
    'x-cds-context-pro-enabled': 'false',
    'x-cds-context-siteid': '206',
    'x-requested-with': 'XMLHttpRequest',
    'content-type': 'application/json'
  };

  const res = await doRequest(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (res.statusCode !== 200) {
    return `Erreur HTTP : ${res.statusCode}`;
  }

  const json = await res.body.json() as any;;

  if (!json.offers || json.offers.length === 0) {
    return 'No active tiles for this instance.';
  }

  return json.offers.map((data: any) => {
    const productName = data.productName || data.name || '';
    const productUrl = data.productUrl || data.url || '';
    const ratingRate = data.ratingRate || '';
    return `
Id: ${data.id}
CategoryId: ${data.categoryId}
MinQuantity: ${data.minQuantity}
ProductId: ${data.productId}
ProductName: ${productName}
ProductUrl: ${productUrl}
RatingRate: ${ratingRate}
Price: ${data.prices?.price?.value ?? '?'} €
OfferId: ${data.prices?.offerId}
`.trim();
  }).join('\n--\n');
}

export async function getProductDetails(productId: string): Promise<string> {
  const url = 'https://bffmobilesite.cdiscount.com/product-sheets/' + productId;

  const headers = {
    'X-CDS-Context-DeviceType': 'unknown',
    'X-CDS-Context-Features': '{newTechnicalDescription=true}',
    'X-CDS-Context-SiteId': '206',
    'X-Requested-With': 'XMLHttpRequest'
  };

  const res = await doRequest(url, {
    method: 'GET',
    headers
  });

  if (res.statusCode !== 200) {
    return `Erreur HTTP : ${res.statusCode}`;
  }

  const root = await res.body.json() as any;;
  const product = Object.values(root)[0] as any;;

  return `
ProductId: ${product.productId}
ProductName: ${product.title}
Price: ${product.prices?.price?.value ?? '?'} €
StrikedPrice: ${product.strikedPrice ?? 0} €
Brand: ${product.brandName}
CDAV Eligible: ${product.isCdav}
Rating: ${product.ratingAverageOverallRating} / 5 (${product.ratingTotalReviewCount} avis)
Shipping: ${product.freeShipping}
Seller: ${product.sellerName}
CategoryId: ${product.categoryId}
URL: https:${product.url}
Image: ${product.media?.[0]?.url}
Description: ${product.technicalDescription?.fullDescription}
`.trim();
}
