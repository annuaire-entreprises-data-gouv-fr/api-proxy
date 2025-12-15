import constants from "../../constants";
import { Exception } from "../../models/exceptions";
import httpClient from "../../utils/network";
import { logErrorInSentry } from "../../utils/sentry";
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

export async function logInGrist(
  tableKey: keyof typeof gristTables,
  data: unknown[]
) {
  try {
    await httpClient({
      method: "POST",
      url: getGristUrl(tableKey),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GRIST_API_KEY}`,
      },
      data: {
        records: data.map((d) => ({ fields: d })),
      },
      timeout: constants.timeout.XXL,
    });
  } catch (error) {
    logErrorInSentry(new LogInGristException({ cause: error }));
    throw error;
  }
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

class LogInGristException extends Exception {
  constructor(args: { cause?: any }) {
    super({
      ...args,
      name: "LogInGristException",
    });
  }
}
