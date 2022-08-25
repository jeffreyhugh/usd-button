import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

import { DateTime } from "luxon";

type Data = {
  count: number;
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case "GET":
      await handleGet(req, res);
      break;
    case "POST":
      await handlePost(req, res);
      break;
    default:
      res.status(405).json({
        count: 0,
        error: "Method not allowed",
      });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<Data>) {
  const supabase = createClient(
    process.env.NEXT_PRIVATE_SUPABASE_URL || "",
    process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE || ""
  );

  const { count, error } = await supabase
    .from("usdbutton_presses")
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) {
    console.error(error);
    res.status(500).json({
      count: count || 0,
      error: "Internal server error",
    });
    return;
  }

  res.status(200).json({
    count: count || 0,
    error: "",
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<Data>) {
  const supabase = createClient(
    process.env.NEXT_PRIVATE_SUPABASE_URL || "",
    process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE || ""
  );

  const { ts } = req.body;

  if (!ts || Math.abs(DateTime.fromISO(ts).diffNow().as("seconds")) > 10) {
    res.status(400).json({
      count: 0,
      error: "Bad request",
    });
    return;
  }

  const { count, error } = await supabase.from("usdbutton_presses").insert(
    {},
    {
      returning: "minimal",
      count: "exact",
    }
  );

  if (error) {
    console.error(error);
    res.status(500).json({
      count: count || 0,
      error: "Internal server error",
    });
    return;
  }

  res.status(200).json({
    count: count || 0,
    error: "",
  });
}
