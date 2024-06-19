import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const healthcheck = asyncHandler(async (req, res) => {
  // healthcheck response that simply returns ok status as josn with message
  return res.status(200).json(new ApiResponse(200, "", "Status : OK"));
});

export { healthcheck };
