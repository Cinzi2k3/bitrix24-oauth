<template>
  <div class="contact-list">
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchTerm" 
        placeholder="Tìm kiếm liên hệ..." 
        @input="filterContacts"
      />
      <i class="fas fa-search search-icon"></i>
    </div>
    
    <div v-if="filteredContacts.length === 0" class="empty-state">
      <i class="fas fa-users empty-icon"></i>
      <p>Không có liên hệ nào. Hãy thêm mới!</p>
    </div>
    
    <div v-else class="contact-table-container">
      <table class="contact-table">
        <thead>
          <tr>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Website</th>
            <th>Địa chỉ</th>
            <th>Thông tin ngân hàng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in filteredContacts" :key="contact.id">
            <td>{{ contact.name }}</td>
            <td>{{ contact.email !== 'Không có email' ? contact.email : '-' }}</td>
            <td>{{ contact.phone !== 'Không có số điện thoại' ? contact.phone : '-' }}</td>
            <td>
              <a v-if="contact.website !== 'Không có website'" :href="contact.website" target="_blank">
                {{ displayUrl(contact.website) }}
              </a>
              <span v-else>-</span>
            </td>
            <td>{{ contact.address !== 'Không có DIACHI' ? contact.address : '-' }}</td>
            <td>{{ contact.bankInfo !== 'Không có thông tin ngân hàng' ? contact.bankInfo : '-' }}</td>
            <td class="action-buttons">
              <button class="btn-action btn-edit" @click="$emit('edit', contact)" title="Sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-action btn-delete" @click="$emit('delete', contact.id)" title="Xóa">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  contacts: {
    type: Array,
    default: () => []
  }
});

defineEmits(['edit', 'delete']);

const searchTerm = ref('');
const filteredContacts = ref([]);

// Khởi tạo filteredContacts từ props.contacts
onMounted(() => {
  filteredContacts.value = [...props.contacts];
});

// Theo dõi thay đổi của props.contacts để cập nhật filteredContacts
watch(() => props.contacts, (newContacts) => {
  // Nếu đang tìm kiếm, lọc theo từ khóa tìm kiếm
  if (searchTerm.value) {
    filteredContacts.value = filterBySearchTerm(newContacts, searchTerm.value);
  } else {
    // Nếu không, hiển thị tất cả
    filteredContacts.value = [...newContacts];
  }
}, { deep: true, immediate: true });

function filterContacts() {
  if (!searchTerm.value) {
    filteredContacts.value = [...props.contacts];
    return;
  }
  
  filteredContacts.value = filterBySearchTerm(props.contacts, searchTerm.value);
}

function filterBySearchTerm(contacts, term) {
  const lowerTerm = term.toLowerCase();
  return contacts.filter(contact =>
    contact.name.toLowerCase().includes(lowerTerm) ||
    (contact.email !== 'Không có email' && contact.email.toLowerCase().includes(lowerTerm)) ||
    (contact.phone !== 'Không có số điện thoại' && contact.phone.toLowerCase().includes(lowerTerm))
  );
}

function displayUrl(url) {
  if (!url) return '';
  // Remove http://, https://, and trailing slashes for display
  return url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
}
</script>

<style scoped>
@import url(../assets/ContactList.css);
</style>