import qs from "query-string";

class urlUtil {
  public static qs = {
    parse: (url: string, options?: { arrayFormat?: "bracket" }) => {
      return qs.parse(url, options);
    },
    stringify: (object: Record<string, any>) => {
      return qs.stringify(object);
    },
  };
}

export default urlUtil;
