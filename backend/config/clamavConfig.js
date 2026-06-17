import ClamScan from "clamscan";

export const clam = await new ClamScan().init({
  clamdscan: {
    host: "localhost",
    port: 3310,
  },
});

console.log("connected");

export const streamScan = async (stream) => {
  return clam.scanStream(stream);
};
