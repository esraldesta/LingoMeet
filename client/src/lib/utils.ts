import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ObjectToformData(obj: Record<string, any>) {
  const formData = new FormData();

  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key])) {
      // obj[key].forEach((item) => {
      //   formData.append(key, item);
      // });
      formData.append(key, obj[key].join(","));
      return;
    }
    formData.append(key, `${obj[key]}`);
  });
  return formData;
}
