const cloudflare = require("cloudflare");
const parseDomain = require("parse-domain").parseDomain;

const cf = cloudflare({
  email: process.env.EMAIL,
  key: process.env.CLOUDFLARE_SECRET_KEY,
});

const getZone = async (domain) => {
  const parsedDomain = parseDomain(domain);
  let zone;
  let zonePage = 1;
  let totalZonePages = 1; // Assume there's at least one
  while (!zone && zonePage <= totalZonePages) {
    const zones = await cf.zones.browse({
      page: zonePage,
    });
    zone = zones.result.find((zone) => {
      const parsedZone = parseDomain(zone.name);
      return (
        parsedDomain.domain == parsedZone.domain &&
        JSON.stringify(parsedDomain.topLevelDomains) ==
          JSON.stringify(parsedZone.topLevelDomains)
      );
    });
    zonePage++;
    totalZonePages = zones.result_info.total_pages;
  }
  return zone;
};

const getDNSRecord = async (zoneId, domain) => {
  let record;
  let recordPage = 1;
  let totalRecordPages = 1; // Assume there's at least one
  while (!record && recordPage <= totalRecordPages) {
    const records = await cf.dnsRecords.browse(zoneId, {
      page: recordPage,
    });
    record = records.result.find((r) => r.name == domain);
    recordPage++;
    totalRecordPages = records.result_info.total_pages;
  }
  return record;
};

const upsertRecord = async (domain, ip) => {
  const zone = await getZone(domain);
  if (!zone) {
    throw new Error("Zone not found");
  }

  const record = await getDNSRecord(zone.id, domain);

  const entry = {
    type: "A",
    name: domain,
    content: ip,
    ttl: "120",
    proxied: false,
  };

  let res;
  if (record) {
    res = await cf.dnsRecords.edit(zone.id, record.id, entry);
  } else {
    res = await cf.dnsRecords.add(zone.id, entry);
  }
  return res;
};

const deleteRecord = async (domain) => {
  const zone = await getZone(domain);
  if (!zone) {
    throw new Error("Zone not found");
  }
  const record = await getDNSRecord(zone.id, domain);
  if (!record) {
    throw new Error("Record not found");
  }
  return cf.dnsRecords.del(zone.id, record.id);
};

module.exports = async (app) => {
  // Detect app domain zone availability
  const zone = await getZone(app.get("domain"));
  if (!zone) {
    throw new Error("Could not connect to CloudFlare zone");
  }
};

module.exports.getZone = getZone;
module.exports.getDNSRecord = getDNSRecord;
module.exports.upsertRecord = upsertRecord;
module.exports.deleteRecord = deleteRecord;
