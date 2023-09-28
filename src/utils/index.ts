export const getAssetsFile = (url: string) => {
	return new URL(`../assets/poker-img/${url}.jpg`, import.meta.url).href;
};
