import { useEffect, useState } from "react";
import { Table, Button, Modal, Input, notification, Space } from "antd";
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { formatRupiah } from '../../Helper/FormatRupiah';
import AddProduct from './AddProduct.jsx';
import axios from 'axios';

const DashboardPanel = () => {
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/products')
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        notification.error({
          message: 'Error',
          description: 'Failed to load products.',
        });
        setLoading(false);
        console.error("Error fetching products:", error);
      });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = products.filter(item =>
      item.barcode.toLowerCase().includes(value) ||
      item.name.toLowerCase().includes(value) ||
      item.price.toString().includes(value) ||
      item.stock.toString().includes(value)
    );

    setFilteredProducts(filtered);
  };

  const handleEditProduct = (record) => {
    setCurrentProduct(record);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    axios.put(`http://localhost:5000/api/editProduct/${currentProduct.barcode}`, currentProduct)
      .then(() => {
        notification.success({
          message: 'Success',
          description: 'Product updated successfully.',
        });
        fetchProducts();
        setEditModalVisible(false);
      })
      .catch((error) => {
        notification.error({
          message: 'Error',
          description: 'Failed to update product.',
        });
        console.error("Error updating product:", error);
      });
  };

  const handleDeleteProduct = (barcode) => {
    axios.delete(`http://localhost:5000/api/deleteProduct/${barcode}`)
      .then(() => {
        notification.success({
          message: 'Success',
          description: 'Product deleted successfully.',
        });
        fetchProducts();
      })
      .catch((error) => {
        notification.error({
          message: 'Error',
          description: 'Failed to delete product.',
        });
        console.error("Error deleting product:", error);
      });
  };

  // Handle table change for pagination
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Barcode",
      dataIndex: "barcode",
      key: "barcode",
      sorter: (a, b) => a.barcode.localeCompare(b.barcode),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => formatRupiah(price),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            shape="round"
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record)}
          >
            Edit
          </Button>
          <Button
            type="default"
            shape="round"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteProduct(record.barcode)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
      <h1 className="text-2xl font-bold mb-6">Obat-obatan</h1>

      <Input
        placeholder="Search all fields"
        value={searchText}
        onChange={handleSearch}
        prefix={<SearchOutlined />}
        className="mb-4 w-3/4"
      />
      <Button type="primary" onClick={fetchProducts} loading={loading}>
        Refresh Products
      </Button>

      <Table
        dataSource={filteredProducts.length > 0 ? filteredProducts : products}
        rowKey="barcode"
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredProducts.length > 0 ? filteredProducts.length : products.length,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
        loading={loading}
        onChange={handleTableChange}
        className='w-3/4'
      />

      <AddProduct onAdd={(newProduct) => setProducts([...products, newProduct])} />

      {/* Edit Product Modal */}
      <Modal
        title="Edit Product"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
      >
        {currentProduct && (
          <div>
            <Input
              placeholder="Product Name"
              value={currentProduct.name}
              onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
              className="mb-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                }
              }}
            />
            <Input
              placeholder="Product Price"
              value={formatRupiah(currentProduct.price)}
              onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value.replace(/[^\d]/g, '') })}
              className="mb-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                }
              }}
            />
            <Input
              placeholder="Product Stock"
              value={currentProduct.stock}
              onChange={(e) => setCurrentProduct({ ...currentProduct, stock: e.target.value })}
              className="mb-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                }
              }}
            />
            <Input
              placeholder="Unit"
              value={currentProduct.unit}
              onChange={(e) => setCurrentProduct({ ...currentProduct, unit: e.target.value })}
              className="mb-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                }
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPanel;
