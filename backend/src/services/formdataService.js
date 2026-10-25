import Product from "../models/Product.js";
import Order from "../models/Order.js";
import {getMongooseEnumOptions} from "../helpers/utils.js";

class FormdataService {
    getProductsCategory() {
        const productsCategory = getMongooseEnumOptions(Product.schema, 'categoria');
        return productsCategory;
    }

 // Estados posibles de un pedido, en formato [{ value, label }] para el select del front.
    // Se leen del enum del modelo Order, así el back es la única fuente de verdad.
    getOrderStatus() {
        const orderStatus = getMongooseEnumOptions(Order.schema, 'estado');
        return orderStatus;
    }
    }


export default new FormdataService();