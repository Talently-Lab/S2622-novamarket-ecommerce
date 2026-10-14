import conectarDB from "../config/db.js"; 
import Producto from "../models/Product.js"

// 2. El array con tus 20 productos de prueba (Mock)
const productosMock = [
    {
        nombre: "Auriculares Bluetooth NovaSound X1",
        descripcion: "Auriculares inalámbricos over-ear con cancelación de ruido activa y 30h de batería",
        precio: 45999.9,
        stock: 24,
        categoria: "accesorios",
        imagenUrl: "https://placehold.co/600x400/png?text=Auriculares%20Bluetooth%20NovaSound%20X1"
    },
    {
        nombre: "Mouse Gamer NovaTech RGB 7200DPI",
        descripcion: "Mouse óptico para gaming con sensor de alta precisión y luces RGB personalizables",
        precio: 18500.0,
        stock: 40,
        categoria: "perifericos",
        imagenUrl: "https://placehold.co/600x400/png?text=Mouse%20Gamer%20NovaTech%20RGB%207200DPI"
    },
    {
        nombre: "Teclado Mecánico NovaKey TKL",
        descripcion: "Teclado mecánico tamaño reducido con switches azules e iluminación LED",
        precio: 52300.5,
        stock: 18,
        categoria: "perifericos",
        imagenUrl: "https://placehold.co/600x400/png?text=Teclado%20Mec%C3%A1nico%20NovaKey%20TKL"
    },
    {
        nombre: "Cargador USB-C NovaCharge 65W",
        descripcion: "Cargador rápido GaN de 65W compatible con notebooks y celulares",
        precio: 15999.0,
        stock: 60,
        categoria: "accesorios",
        imagenUrl: "https://placehold.co/600x400/png?text=Cargador%20USB-C%20NovaCharge%2065W"
    },
    {
        nombre: "Power Bank NovaEnergy 20000mAh",
        descripcion: "Batería portátil de carga rápida con doble puerto USB-A y USB-C",
        precio: 22750.0,
        stock: 35,
        categoria: "accesorios",
        imagenUrl: "https://placehold.co/600x400/png?text=Power%20Bank%20NovaEnergy%2020000mAh"
    },
    {
        nombre: "Smartwatch NovaFit Pulse",
        descripcion: "Reloj inteligente con monitor de frecuencia cardíaca y notificaciones",
        precio: 68900.0,
        stock: 15,
        categoria: "gadgets",
        imagenUrl: "https://placehold.co/600x400/png?text=Smartwatch%20NovaFit%20Pulse"
    },
    {
        nombre: "Parlante Bluetooth NovaBoom Mini",
        descripcion: "Parlante portátil resistente al agua con 12h de autonomía",
        precio: 27400.0,
        stock: 28,
        categoria: "gadgets",
        imagenUrl: "https://placehold.co/600x400/png?text=Parlante%20Bluetooth%20NovaBoom%20Mini"
    },
    {
        nombre: "Webcam HD NovaView 1080p",
        descripcion: "Webcam full HD con micrófono integrado para videollamadas",
        precio: 19850.0,
        stock: 22,
        categoria: "perifericos",
        imagenUrl: "https://placehold.co/600x400/png?text=Webcam%20HD%20NovaView%201080p"
    },
    {
        nombre: "Hub USB NovaConnect 7 en 1",
        descripcion: "Hub multipuerto con USB 3.0, HDMI y lector de tarjetas SD",
        precio: 24300.0,
        stock: 30,
        categoria: "accesorios",
        imagenUrl: "https://placehold.co/600x400/png?text=Hub%20USB%20NovaConnect%207%20en%201"
    },
    {
        nombre: "Mousepad Gamer NovaGrip XL",
        descripcion: "Alfombrilla extendida antideslizante con base de goma",
        precio: 8900.0,
        stock: 50,
        categoria: "accesorios",
        imagenUrl: "https://placehold.co/600x400/png?text=Mousepad%20Gamer%20NovaGrip%20XL"
    },
    {
        nombre: "Auriculares Gamer NovaSound G7",
        descripcion: "Headset con micrófono desmontable y sonido envolvente 7.1",
        precio: 39900.0,
        stock: 20,
        categoria: "perifericos",
        imagenUrl: "https://placehold.co/600x400/png?text=Auriculares%20Gamer%20NovaSound%20G7"
    },
    {
        nombre: "Cámara de Seguridad NovaEye WiFi",
        descripcion: "Cámara IP con visión nocturna y detección de movimiento",
        precio: 34750.0,
        stock: 12,
        categoria: "gadgets",
        imagenUrl: "https://placehold.co/600x400/png?text=C%C3%A1mara%20de%20Seguridad%20NovaEye%20WiFi"
    },
    {
        nombre: "Cable USB-C a HDMI NovaLink 2m",
        descripcion: "Cable adaptador para conectar dispositivos a monitores externos",
        precio: 9450.0,
        stock: 45,
        categoria: "accesorios",
        imagenUrl: "https://placehold.co/600x400/png?text=Cable%20USB-C%20a%20HDMI%20NovaLink%202m"
    },
    {
        nombre: "Soporte para Notebook NovaStand Alu",
        descripcion: "Soporte ergonómico de aluminio ajustable en altura",
        precio: 16200.0,
        stock: 26,
        categoria: "accesorios",
        imagenUrl: "https://placehold.co/600x400/png?text=Soporte%20para%20Notebook%20NovaStand%20Alu"
    },
    {
        nombre: "Micrófono de Escritorio NovaVoice USB",
        descripcion: "Micrófono condensador USB para streaming y videollamadas",
        precio: 31500.0,
        stock: 17,
        categoria: "perifericos",
        imagenUrl: "https://placehold.co/600x400/png?text=Micr%C3%B3fono%20de%20Escritorio%20NovaVoice%20USB"
    },
    {
        nombre: "Lámpara LED NovaLight Desk",
        descripcion: "Lámpara de escritorio con brillo regulable y carga USB",
        precio: 12800.0,
        stock: 33,
        categoria: "gadgets",
        imagenUrl: "https://placehold.co/600x400/png?text=L%C3%A1mpara%20LED%20NovaLight%20Desk"
    },
    {
        nombre: "Adaptador WiFi USB NovaSignal AC600",
        descripcion: "Adaptador de red inalámbrico de alta velocidad",
        precio: 7650.0,
        stock: 55,
        categoria: "accesorios",
        imagenUrl: "https://placehold.co/600x400/png?text=Adaptador%20WiFi%20USB%20NovaSignal%20AC600"
    },
    {
        nombre: "Control Gamer NovaPlay Wireless",
        descripcion: "Joystick inalámbrico compatible con PC y consolas",
        precio: 29900.0,
        stock: 19,
        categoria: "perifericos",
        imagenUrl: "https://placehold.co/600x400/png?text=Control%20Gamer%20NovaPlay%20Wireless"
    },
    {
        nombre: "Disco Externo SSD NovaSpeed 500GB",
        descripcion: "Unidad de almacenamiento externo portátil de alta velocidad",
        precio: 54200.0,
        stock: 14,
        categoria: "gadgets",
        imagenUrl: "https://placehold.co/600x400/png?text=Disco%20Externo%20SSD%20NovaSpeed%20500GB"
    },
    {
        nombre: "Ventilador USB NovaCool Desk",
        descripcion: "Mini ventilador de escritorio con conexión USB",
        precio: 6500.0,
        stock: 48,
        categoria: "gadgets",
        imagenUrl: "https://placehold.co/600x400/png?text=Ventilador%20USB%20NovaCool%20Desk"
    }
];

async function sembrarDatos() {
    try {
        await conectarDB();
        console.log('🔌 Conectado a MongoDB para la inserción...');

        await Producto.deleteMany({});
        console.log('🗑️ Colección limpiada con éxito.');

        await Producto.insertMany(productosMock);
        console.log('✅ ¡Se han subido los 20 productos de prueba exitosamente!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al subir el mock:', error);
        process.exit(1);
    }
}

sembrarDatos();
