import lodash from "lodash";

const getOrFind = async ({ service, fields, id }) => {
  try {
    let data;
    if (id) {
      data = await service.get(id);
    } else {
      data = await service.find();
    }
    if (fields && fields.length) {
      if (Array.isArray(data)) {
        console.table(data, fields);
      } else {
        console.table(lodash.pick(data, fields));
      }
    } else {
      console.table(data);
    }
  } catch (err) {
    console.error(err.message || err);
  }
  process.exit();
};

export default getOrFind;
