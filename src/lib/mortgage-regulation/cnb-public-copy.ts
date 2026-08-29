/**
 * Canonical Czech/English wording for ČNB investment-mortgage recommendation.
 * Primary source:
 * https://www.cnb.cz/cs/cnb-news/tiskove-zpravy/CNB-doporucuje-prisnejsi-limity-pro-investicni-hypoteky.-Kapitalove-rezervy-se-nemeni/
 */
import {
  CNB_INVESTMENT_RECOMMENDATION_BODY,
  CNB_INVESTMENT_SOURCE_URL,
  CNB_OWNER_OCCUPIED_BODY,
} from "@/lib/legal/regulatory-texts";

export {
  CNB_INVESTMENT_RECOMMENDATION_TITLE,
  CNB_INVESTMENT_RECOMMENDATION_BODY,
  CNB_OWNER_OCCUPIED_TITLE,
  CNB_OWNER_OCCUPIED_BODY,
  CNB_PURPOSE_DISTINCTION,
  CNB_INVESTMENT_SOURCE_URL,
} from "@/lib/legal/regulatory-texts";

/** @deprecated Prefer CNB_INVESTMENT_RECOMMENDATION_BODY.cs */
export const CNB_INVESTMENT_RECOMMENDATION_CS =
  CNB_INVESTMENT_RECOMMENDATION_BODY.cs;

/** @deprecated Prefer CNB_OWNER_OCCUPIED_BODY.cs */
export const CNB_OWN_HOUSING_LTV_CS = CNB_OWNER_OCCUPIED_BODY.cs;
