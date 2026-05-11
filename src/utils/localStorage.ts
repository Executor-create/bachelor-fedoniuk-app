export const setItemToLocalStorage = (key: string, value: string): void => {
  localStorage.setItem(key, value);
}

export const getItemFromLocalStorage = (key: string): string | null => {
  return localStorage.getItem(key);
}

export const removeItemFromLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
}