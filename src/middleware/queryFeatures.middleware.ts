import { RequestHandler } from "express";
import { IQueryFeatures } from "../interfaces/queryFeatures.interface";

const queryFeatures = (
  documentNumber: "single" | "multiple"
): RequestHandler => {
  return (req, res, next) => {
    // set fileds that wanted
    const fieldsObj: { [key: string]: boolean } = {};

    // select fields
    if (req.query.fields) {
      let fields = String(req.query.fields);
      fields = fields.split(",").join(" ");

      // create fields object
      fields.split(" ").forEach((el) => {
        fieldsObj[el] = true;
      });
    }

    // lookup control
    const populateObj: { [key: string]: boolean } = {};

    if (req.query.populate) {
      let populate = String(req.query.populate);
      populate = populate.split(",").join(" ");

      // create fields object
      populate.split(" ").forEach((el) => {
        populateObj[el] = true;
      });
    }

    if (documentNumber === "single") {
      const queryFeaturesObj: Partial<IQueryFeatures> = {
        fields: fieldsObj,
        populate: populateObj,
      };

      req.queryFeatures = queryFeaturesObj;
    } else {
      // set limit and skip to the request
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 5;
      const skip: number = (page - 1) * limit;
      const searchKey: string = req.query.searchKey
        ? String(req.query.searchKey)
        : "";

      let sort = req.query.sort;

      // create sort object
      const sortObj: {
        [key: string]: "asc" | "desc";
      } = {};

      if (sort) {
        sort = String(sort);
        sort = sort.split(",").join(" ");
        sort.split(" ").forEach((el) => {
          if (el.startsWith("-")) {
            sortObj[el.slice(1)] = "desc";
          } else {
            sortObj[el] = "asc";
          }
        });
      } else {
        sortObj["createdAt"] = "asc";
      }

      // get filters
      const query: object = req.query;
      const filters: { [key: string]: number | string | boolean } = {
        ...query,
      };

      const excludedFields = [
        "page",
        "sort",
        "limit",
        "fields",
        "searchKey",
        "populate",
      ];

      excludedFields.forEach((el) => delete filters[el]);

      Object.keys(filters).forEach((key) => {
        if (filters[key] === "true") {
          filters[key] = true;
        } else if (filters[key] === "false") {
          filters[key] = false;
        } else if (Number(filters[key])) {
          filters[key] = Number(filters[key]);
        }
      });

      const queryFeaturesObj: IQueryFeatures = {
        page,
        limit,
        skip,
        fields: fieldsObj,
        filters,
        populate: populateObj,
        sort: sortObj,
        searchKey,
      };

      req.queryFeatures = queryFeaturesObj;
    }

    next();
  };
};

export default queryFeatures;
