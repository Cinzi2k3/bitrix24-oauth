const { callApi } = require('../services/bitrixApi');
const { loadTokens } = require('../services/tokenService');
const axios = require('axios');

// Lấy danh sách contact
exports.getContacts = async (req, res) => {
    try {
        const tokens = await loadTokens();
        if (!tokens || !tokens.access_token) throw new Error('❌ Không có token hợp lệ!');

        // Lấy danh sách contact
        const contactResponse = await axios.get(`${tokens.client_endpoint}crm.contact.list`, {
            params: {
                auth: tokens.access_token,
                select: ["ID", "NAME", "LAST_NAME", "EMAIL", "PHONE", "WEB", "SOURCE_DESCRIPTION", "ADDRESS"]
            }
        });
        const contacts = contactResponse.data.result || [];

        // Lấy danh sách địa chỉ
        const addressResponse = await axios.get(`${tokens.client_endpoint}crm.address.list`, {
            params: {
                auth: tokens.access_token,
                select: ["ENTITY_ID", "ADDRESS_1", "CITY", "REGION", "COUNTRY"]
            }
        });
        const addresses = addressResponse.data.result || [];

        // Ánh xạ contact với địa chỉ
        const contactMap = contacts.map(contact => {
            const address = addresses.find(addr => String(addr.ENTITY_ID) === String(contact.ID)) || {};
            return {
                id: contact.ID,
                name: `${contact.LAST_NAME} ${contact.NAME}`.trim(),
                email: contact.EMAIL ? contact.EMAIL[0]?.VALUE : "Không có email",
                phone: contact.PHONE ? contact.PHONE[0]?.VALUE : "Không có số điện thoại",
                website: contact.WEB ? contact.WEB[0]?.VALUE : "Không có website",
                address: contact.ADDRESS || (address.ADDRESS_1 ? `${address.ADDRESS_1}, ${address.REGION || ''}, ${address.CITY || ''}, ${address.COUNTRY || ''}`.trim() : "Không có địa chỉ"),
                bankInfo: contact.SOURCE_DESCRIPTION || "Không có thông tin ngân hàng"
            };
        });

        res.json(contactMap);
    } catch (error) {
        console.error('❌ Lỗi gọi API contact:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};

//Thêm mới contact
exports.addContact = async (req, res) => {
  try {
    const { ADDRESS, ...contactFields } = req.body.fields;
    const contactResponse = await callApi('crm.contact.add', { fields: contactFields });

    if (ADDRESS?.[0]?.VALUE) {
      await callApi('crm.address.add', {
        fields: {
          TYPE_ID: 1,
          ENTITY_TYPE_ID: 3,
          ENTITY_ID: contactResponse.result,
          ADDRESS_1: ADDRESS[0].VALUE
        }
      });
    }

    res.json(contactResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

//Sửa contact
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { fields } = req.body;

    const currentContact = await callApi('crm.contact.get', { id });
    const currentFields = currentContact.result || {};

    const updatedFields = {
      LAST_NAME: fields.LAST_NAME,
      NAME: fields.NAME,
      SOURCE_DESCRIPTION: fields.SOURCE_DESCRIPTION,
      ADDRESS: fields.ADDRESS?.[0]?.VALUE,
      EMAIL: fields.EMAIL?.map((email, i) => ({
        ID: currentFields.EMAIL?.[i]?.ID || null,
        VALUE: email.VALUE,
        VALUE_TYPE: email.VALUE_TYPE || 'WORK'
      })),
      PHONE: fields.PHONE?.map((phone, i) => ({
        ID: currentFields.PHONE?.[i]?.ID || null,
        VALUE: phone.VALUE,
        VALUE_TYPE: phone.VALUE_TYPE || 'WORK'
      })),
      WEB: fields.WEB?.map((web, i) => ({
        ID: currentFields.WEB?.[i]?.ID || null,
        VALUE: web.VALUE,
        VALUE_TYPE: web.VALUE_TYPE || 'WORK'
      }))
    };

    const result = await callApi('crm.contact.update', { id, fields: updatedFields });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Xóa contact
exports.deleteContact = async (req, res) => {
  try {
    const response = await callApi('crm.contact.delete', { id: req.params.id });
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
