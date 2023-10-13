export const getAssetsFile = (url: string) => {
	return new URL(`../assets/images/${url}.jpg`, import.meta.url).href;
};
