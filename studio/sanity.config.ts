import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { deskStructure } from "./deskStructure";

// Điền SANITY_STUDIO_PROJECT_ID sau khi tạo project thật tại sanity.io/manage
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "REPLACE_WITH_PROJECT_ID";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "phong-thuy-thien-anh",
  title: "Phong Thủy Thiên Anh — Quản trị nội dung",

  projectId,
  dataset,

  plugins: [structureTool({ structure: deskStructure }), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
