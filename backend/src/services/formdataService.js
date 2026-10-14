import Product from "../models/Product.js";
import {getMongooseEnumOptions} from "../helpers/utils.js";

class FormdataService {
    getProductsCategory() {
        const productsCategory = getMongooseEnumOptions(Product.schema, 'categoria');
        return productsCategory;
    }
}

export default new FormdataService();