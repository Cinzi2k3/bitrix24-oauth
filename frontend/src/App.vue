<template>
  <div class="container">
    <header class="app-header">
      <h1>Quản lý Contact</h1>
      <button class="btn btn-primary" @click="showAddModal">
        <i class="fas fa-plus"></i> Thêm Contact
      </button>
    </header>

    <!-- Danh sách contact -->
    <ContactList :contacts="contacts" @edit="showEditModal" @delete="deleteContact" />

    <!-- Modal thêm/sửa -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="saveContact">
          <div class="form-row">
            <div class="form-group">
              <label>Họ</label>
              <input v-model="form.LAST_NAME" required placeholder="Nhập họ" />
            </div>
            <div class="form-group">
              <label>Tên</label>
              <input v-model="form.NAME" required placeholder="Nhập tên" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.EMAIL" type="email" placeholder="example@email.com" />
            </div>
            <div class="form-group">
              <label>Số điện thoại</label>
              <input v-model="form.PHONE" type="tel" placeholder="0123456789" />
            </div>
          </div>
          
          <div class="form-group">
            <label>Website</label>
            <input v-model="form.WEB" type="url" placeholder="https://example.com" />
          </div>
          
          <div class="form-group">
            <label>Địa chỉ</label>
            <input v-model="form.ADDRESS" placeholder="Địa chỉ liên hệ" />
          </div>
          
          <div class="form-group">
            <label>Thông tin ngân hàng</label>
            <input v-model="form.SOURCE_DESCRIPTION" placeholder="Số tài khoản và tên ngân hàng" />
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-success">
              <i class="fas fa-save"></i> Lưu
            </button>
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <i class="fas fa-times"></i> Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import ContactList from "./components/ContactList.vue";

const API_BASE = "http://localhost:3000";

// Danh sách contact
const contacts = ref([]);
const showModal = ref(false);
const modalTitle = ref("Thêm Contact");
const currentContactId = ref(null);

// Biến lưu dữ liệu form
const form = ref({
  LAST_NAME: "",
  NAME: "",
  EMAIL: "",
  PHONE: "",
  WEB: "",
  ADDRESS: "",
  SOURCE_DESCRIPTION: "",
});

// Load danh sách contact
const loadContacts = async () => {
  try {
    const response = await axios.get(`${API_BASE}/contacts`);
    contacts.value = response.data;
  } catch (error) {
    console.error("Lỗi load contacts:", error);
    alert("Không thể tải danh sách contact");
  }
};

// Hiển thị modal thêm mới
const showAddModal = () => {
  modalTitle.value = "Thêm Contact";
  currentContactId.value = null;
  resetForm();
  showModal.value = true;
};

// Hiển thị modal sửa contact
const showEditModal = (contact) => {
  modalTitle.value = "Sửa Contact";
  currentContactId.value = contact.id;
  
  form.value = {
    LAST_NAME: contact.name.split(" ")[0] || "",
    NAME: contact.name.split(" ").slice(1).join(" ") || "",
    EMAIL: contact.email !== "Không có email" ? contact.email : "",
    PHONE: contact.phone !== "Không có số điện thoại" ? contact.phone : "",
    WEB: contact.website !== "Không có website" ? contact.website : "",
    ADDRESS: contact.address !== "Không có DIACHI" ? contact.address : "",
    SOURCE_DESCRIPTION: contact.bankInfo !== "Không có thông tin ngân hàng" ? contact.bankInfo : ""
  };
  
  showModal.value = true;
};

// Reset form
const resetForm = () => {
  form.value = {
    LAST_NAME: "",
    NAME: "",
    EMAIL: "",
    PHONE: "",
    WEB: "",
    ADDRESS: "",
    SOURCE_DESCRIPTION: "",
  };
};

// Lưu contact
const saveContact = async () => {
  try {
    // Chuẩn bị dữ liệu đúng định dạng
    const contactData = {
      LAST_NAME: form.value.LAST_NAME,
      NAME: form.value.NAME,
      EMAIL: form.value.EMAIL ? [{ VALUE: form.value.EMAIL }] : [],
      PHONE: form.value.PHONE ? [{ VALUE: form.value.PHONE }] : [],
      WEB: form.value.WEB ? [{ VALUE: form.value.WEB }] : [],
      ADDRESS: form.value.ADDRESS ? [{ VALUE: form.value.ADDRESS }] : [],
      SOURCE_DESCRIPTION: form.value.SOURCE_DESCRIPTION
    };

    if (currentContactId.value) {
      // Gọi API update
      const response = await axios.put(`${API_BASE}/update/${currentContactId.value}`, {
        fields: contactData
      });
      
      console.log('Update response:', response.data);
    } else {
      // Gọi API thêm mới
      const response = await axios.post(`${API_BASE}/add`, {
        fields: contactData
      });
      
      console.log('Add response:', response.data);
    }

    await loadContacts();
    alert(currentContactId.value ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
    closeModal();
  } catch (error) {
    console.error('Error saving contact:', {
      message: error.message,
      response: error.response?.data
    });
    
    alert(`Lỗi: ${error.response?.data?.error || error.message}`);
  }
};

// Xóa contact
const deleteContact = async (id) => {
  if (confirm("Bạn có chắc muốn xóa contact này?")) {
    try {
      await axios.delete(`${API_BASE}/delete/${id}`);
      alert("Xóa contact thành công!");
      loadContacts();
    } catch (error) {
      console.error("Lỗi xóa contact:", error);
      alert("Có lỗi xảy ra khi xóa contact!");
    }
  }
};

// Đóng modal
const closeModal = () => {
  showModal.value = false;
};

// Khi component mounted, load danh sách contacts
onMounted(() => {
  loadContacts();
});
</script>

<style scoped>
@import url(./assets/App.css);
</style>