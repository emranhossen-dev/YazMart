import React from "react";
import { getShopData } from "../actions/shop";
import { getHomepageConfig } from "../actions/homepage";
import HomePageClient from "../components/HomePageClient";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

export default async function HomePage() {
  const shopData = await getShopData("all");
  const configRes = await getHomepageConfig();

  return (
    <HomePageClient
      initialShopData={shopData || {}}
      initialConfig={configRes?.config || null}
    />
  );
}
