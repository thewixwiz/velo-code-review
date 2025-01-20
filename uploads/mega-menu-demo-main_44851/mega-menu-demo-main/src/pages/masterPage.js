import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(function () {
	setupMegaMenu("Shoes");
});

async function setupMegaMenu(name) {
	await populateMainMedia(name);
	await populateProductsRepeater(name);
}

async function getMenuCollectionData(name) {
	const queryResult = await wixData.query("Stores/Collections").eq("name", name).find();
	return queryResult.items[0];
}

async function populateMainMedia(name) {
	const collection = await getMenuCollectionData(name);
	$w("#mainMedia").src = collection.mainMedia;
}

async function getCollectionProductsData(name) {
	const collection = await getMenuCollectionData(name);
	const queryResult = await wixData.query("Stores/Products").hasSome("collections", collection._id).find();
	return queryResult.items;
}

async function populateProductsRepeater(name) {
	$w("#productsRepeater").onItemReady(($item, itemData)=>{
		$item("#productName").text = itemData.name;
		$item("#productName").onClick(()=>{
			wixLocationFrontend.to(itemData.productPageUrl)
		})
	})

	const productsData = await getCollectionProductsData(name);
	$w("#productsRepeater").data = productsData;
}