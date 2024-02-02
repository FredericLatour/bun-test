import { createStorefrontApiClient } from "@shopify/storefront-api-client"
import { get } from "effect/Chunk"
import { Logger } from "tslog"

const client = createStorefrontApiClient({
  storeDomain: process.env.PUBLIC_SHOPIFY_SHOP ?? "",
  apiVersion: "2024-01",
  privateAccessToken: process.env.PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "",
})

const log = new Logger()

const first3 = `{
  products (first: 20) {
    edges {
      node {
        id
        availableForSale
        title
        productType
        tags
        handle
        featuredImage {
          originalSrc
          altText
          thumbnail: url(transform: { maxWidth: 80, maxHeight: 80 })
        }
  
      }
    }
  }
}`

const productQuery = `
  query ProductQuery($handle: String) {
    product(handle: $handle) {
      id
      title
      handle
      description
      onlineStoreUrl
      featuredImage {
        originalSrc
        altText
        thumbnail: url(transform: { maxWidth: 80, maxHeight: 80 })
      }
      tags
      productType
      priceRange { # Returns range of prices for a product in the shop's currency.
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
}
  }
`


const getCollections = `query getCollections {
  collections(first: 10) {
    edges {
      cursor
      node {
        id
        handle
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}`

export type ShopifyCollection = {
  collection: {
    id: string
    title: string
    products: {
      edges: Array<{
        node: {
          id: string
          title: string
          description: string
          availableForSale: boolean
          onlineStoreUrl: string
          featuredImage: {
            originalSrc: string
            altText: any
            thumbnail: string
          }
          priceRange: {
            minVariantPrice: {
              amount: string
              currencyCode: string
            }
            maxVariantPrice: {
              amount: string
              currencyCode: string
            }
          }
        }
      }>
    }
  }
}

const getProductsInCollection = `query getProductsInCollection($handle: String!) {
  collection(handle: $handle) {
    id
    title
    products(first: 2, sortKey: BEST_SELLING) {
      edges {
        node {
          id
          title
          description
          availableForSale
          onlineStoreUrl
          featuredImage {
            originalSrc
            altText
            thumbnail: url(transform: { maxWidth: 80, maxHeight: 80 })
          }
          tags
          productType
          priceRange { # Returns range of prices for a product in the shop's currency.
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
}
`

// const coll = await client.request(getCollections)
// log.info(coll)

const request = await client.request<ShopifyCollection>(getProductsInCollection, {
  variables: {
    handle: "ellenas-pick",
  },
})
log.info(request)
log.info(request.data?.collection?.title)
const sProducts = request.data?.collection?.products?.edges
// const products = sProducts?.map((p) => ({
//   displayName: p.node.title,
//   header: p.node.description,
//   url: p.node.onlineStoreUrl,
//   imageUrl: p.node.featuredImage.thumbnail,
//   price: p.node.priceRange.minVariantPrice.amount,
//   currency: p.node.priceRange.minVariantPrice.currencyCode,
// }))

log.info(sProducts)

const result = await client.request(productQuery, {
  variables: {
    handle: 'solomon_2_luck_gold',
  },
})

log.info(result)
