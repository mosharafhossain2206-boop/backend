const { customError } = require("../helpers/customError");

exports.authorize = (resource, requiredAction) => {
  return async (req, _, next) => {
    try {
      if (!req.user) {
        throw new customError(401, "Unauthorized");
      }
      const isAuthorized = req.user.permission.find(
        (p) => p.permissionId.slug === resource
      );
      if (!isAuthorized) {
        throw new customError(401, "Unauthorized access permission denied");
      }

      if (!isAuthorized?.actions?.includes(requiredAction)) {
        throw new customError(401, "Unauthorized access permission denied");
      }

      console.log(isAuthorized);
      // next();
    } catch (error) {
      next(error);
    }
  };
};
