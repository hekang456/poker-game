export const getAssetsFile = (url: string) => {
	return new URL(`../../public/images/${url}.jpg`, import.meta.url).href;
};
