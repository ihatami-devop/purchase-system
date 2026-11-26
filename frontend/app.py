import os

from flask import Flask, render_template

app = Flask(__name__)

CLIENT_API_URL = os.getenv(
    "CLIENT_API_URL",
    os.getenv("CLIENT_API_URL")
)

COMPONENTS = {
    "CPU": [
        {
            "id": "cpu-1",
            "name": "AMD Ryzen 5 7600X",
            "price": 249.99,
            "stock": 12,
            "specs": ["AM5 Socket", "6 Cores", "105W TDP"],
            "socket": "AM5",
            "tdp": 105
        },
        {
            "id": "cpu-2",
            "name": "Intel Core i5-14600K",
            "price": 319.99,
            "stock": 8,
            "specs": ["LGA1700 Socket", "14 Cores", "125W TDP"],
            "socket": "LGA1700",
            "tdp": 125
        }
    ],

    "Motherboard": [
        {
            "id": "mb-1",
            "name": "ASUS TUF Gaming B650-PLUS",
            "price": 189.99,
            "stock": 6,
            "specs": ["AM5 Socket", "DDR5", "ATX"],
            "socket": "AM5",
            "memory_type": "DDR5",
            "form_factor": "ATX"
        },
        {
            "id": "mb-2",
            "name": "MSI PRO B760M-A",
            "price": 149.99,
            "stock": 10,
            "specs": ["LGA1700 Socket", "DDR5", "Micro-ATX"],
            "socket": "LGA1700",
            "memory_type": "DDR5",
            "form_factor": "Micro-ATX"
        }
    ],

    "RAM": [
        {
            "id": "ram-1",
            "name": "Corsair Vengeance 32GB DDR5",
            "price": 99.99,
            "stock": 20,
            "specs": ["32GB", "DDR5", "6000MHz"],
            "memory_type": "DDR5"
        },
        {
            "id": "ram-2",
            "name": "Kingston Fury 16GB DDR4",
            "price": 54.99,
            "stock": 15,
            "specs": ["16GB", "DDR4", "3200MHz"],
            "memory_type": "DDR4"
        }
    ],

    "GPU": [
        {
            "id": "gpu-1",
            "name": "NVIDIA RTX 4070 SUPER",
            "price": 599.99,
            "stock": 5,
            "specs": ["12GB GDDR6X", "220W"],
            "power": 220,
            "length": 300
        },
        {
            "id": "gpu-2",
            "name": "AMD Radeon RX 7800 XT",
            "price": 499.99,
            "stock": 7,
            "specs": ["16GB GDDR6", "263W"],
            "power": 263,
            "length": 320
        }
    ],

    "Storage": [
        {
            "id": "storage-1",
            "name": "Samsung 990 PRO 1TB",
            "price": 109.99,
            "stock": 18,
            "specs": ["1TB", "NVMe", "PCIe 4.0"]
        },
        {
            "id": "storage-2",
            "name": "WD Blue SN580 2TB",
            "price": 119.99,
            "stock": 11,
            "specs": ["2TB", "NVMe", "PCIe 4.0"]
        }
    ],

    "PSU": [
        {
            "id": "psu-1",
            "name": "Corsair RM750e",
            "price": 99.99,
            "stock": 9,
            "specs": ["750W", "80+ Gold"],
            "wattage": 750
        },
        {
            "id": "psu-2",
            "name": "EVGA 500 BR",
            "price": 49.99,
            "stock": 13,
            "specs": ["500W", "80+ Bronze"],
            "wattage": 500
        }
    ],

    "Case": [
        {
            "id": "case-1",
            "name": "NZXT H5 Flow",
            "price": 94.99,
            "stock": 8,
            "specs": ["ATX", "GPU clearance: 365mm"],
            "form_factors": ["ATX", "Micro-ATX"],
            "gpu_clearance": 365
        },
        {
            "id": "case-2",
            "name": "Cooler Master Q300L",
            "price": 59.99,
            "stock": 10,
            "specs": ["Micro-ATX", "GPU clearance: 360mm"],
            "form_factors": ["Micro-ATX"],
            "gpu_clearance": 360
        }
    ],

    "Cooling": [
        {
            "id": "cooling-1",
            "name": "Cooler Master Hyper 212",
            "price": 39.99,
            "stock": 14,
            "specs": ["Air Cooler", "AM5", "LGA1700"],
            "supported_sockets": ["AM5", "LGA1700"]
        },
        {
            "id": "cooling-2",
            "name": "DeepCool AK400",
            "price": 34.99,
            "stock": 16,
            "specs": ["Air Cooler", "AM5", "LGA1700"],
            "supported_sockets": ["AM5", "LGA1700"]
        }
    ]
}

# Public product photos from the prior design pass. The first CPU listing is
# intentionally omitted because its host currently serves an expired TLS cert.
PRODUCT_IMAGES = {
    "cpu-2": "https://cdn.visaovip.com/img/prod/processador-intel-core-i5-14600k-socket-lga-1700-35ghz-24mb/42125/599218.jpg",
    "mb-1": "https://media.ldlc.com/r1600/ld/products/00/05/98/60/LD0005986038.jpg",
    "mb-2": "https://asset.msi.com/resize/image/global/product/product_16922492410597d5c7fda1bf4286a09b05420a4f1c.png62405b38c58fe0f07fcef2367d8a9ba1/1024.png",
    "ram-1": "https://needy.shop/cdn/shop/files/2_01d62435-7b00-43b4-b973-06863d319aad_700x700.jpg?v=1716537197",
    "ram-2": "https://plazait.co.id/uploads/products/gallery/kingston-memory-ddr4-3200mhz-fury-beast-cl16-for-pc-1762247708-661.jpg",
    "gpu-1": "https://www.topmarket.co.il/images/detailed/231/b0866bf1df7b133722fc73e4a64ebe49_daeb-ml.png",
    "gpu-2": "https://photo2.tinhte.vn/data/attachment-files/2023/10/8167940_tren-tay-amd-radeon-rx-7800-xt-tinhte-4.jpg",
    "storage-1": "https://images.samsung.com/kdp/goods/2022/09/21/287ad1ec-ecef-40e3-be01-51051ff65ccb.png",
    "storage-2": "https://cdn.cs.1worldsync.com/71/20/7120a7fe-b1ad-4cdb-8dac-129084637b97.jpg",
    "psu-1": "https://www.dateks.lv/images/pic/1200/1200/963/1885.jpg",
    "psu-2": "https://i5.walmartimages.com/seo/EVGA-BR-Series-500W-80-Bronze-Power-Supply_0d52466c-5765-43d0-ada9-2ca77a054d60_1.e943155591c1b000acc7914735cc63d8.jpeg",
    "case-1": "https://tms.co.il/image/catalog/products/CC-H51FB-01/2g9X4MQoCg.png",
    "case-2": "https://cdn.dooca.store/34971/products/gallery-1-min-image_620x620%2Bfill_ffffff.png?v=1715617083&webp=0",
    "cooling-1": "https://www.adorama.com/images/Large/CMRS4KK25SNR.JPG",
    "cooling-2": "https://cdn.shoppub.io/cdn-cgi/image/w%3D1000%2Ch%3D1000%2Cq%3D80%2Cf%3Dauto/oficinadosbits/media/uploads/produtos/foto/xxxupcvp/file.png",
}

for products in COMPONENTS.values():
    for product in products:
        product["image"] = PRODUCT_IMAGES.get(product["id"])


@app.route("/")
def index():
    return render_template(
        "index.html",
        components=COMPONENTS,
        categories=["CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case", "Cooling"],
        client_api_url=CLIENT_API_URL
    )


@app.route("/health")
def health():
    return {"status": "healthy"}, 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
