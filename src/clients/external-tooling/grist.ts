import constants from "../../constants";
import httpClient from "../../utils/network";
import routes from "../urls";

type IGristRecords = {
  records: {
    fields: any;
  }[];
};

const gristTables = {
  "feature-flags": {
    docId: "uE2WGSjyBbSfiuSGbQiN9K",
    tableId: "Feature_flags",
  },
} as const;

function getGristUrl(tableKey: keyof typeof gristTables) {
  const gristIds = gristTables[tableKey];

  if (!gristIds) {
    throw new Error(`${tableKey} is unknown, DOC ID and TABLE ID are required`);
  }
  if (!process.env.GRIST_API_KEY) {
    throw new Error("GRIST_API_KEY environment variable is not set");
  }
  return `${routes.tooling.grist}${gristIds.docId}/tables/${gristIds.tableId}/records`;
}

export async function readFromGrist(
  tableKey: keyof typeof gristTables,
  timeout: number = constants.timeout.XXL
) {
  const { records } = await httpClient<IGristRecords>({
    method: "GET",
    url: getGristUrl(tableKey),
    headers: {
      Authorization: `Bearer ${process.env.GRIST_API_KEY}`,
    },
    timeout,
  });

  return records.map((r: any) => r.fields);
}
