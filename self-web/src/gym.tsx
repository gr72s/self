import {fetchGet, fetchPost} from "./http.ts";
import {useEffect, useState} from "react";
import BasicTable from "./BasicTable.tsx";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import * as React from "react";


interface Gym {
  id?: number;
  name: string,
  location: string
}

const initialFormState: Gym = {
  name: '',
  location: ''
}

async function getGym() {
  return await fetchGet<Gym[]>("/api/lifting/gym")
}

async function addGym(data: Gym) {
  return await fetchPost<Gym>("/api/lifting/gym", data)
}

export default function Gym() {

  const [gyms, setGyms] = useState<Gym[]>([])
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Gym>(initialFormState);

  useEffect(() => {
    loadData()
  }, []);

  const loadData = async () => {
      const data = await getGym();
      setGyms(data);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormState); // 可选：关闭时重置表单
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await addGym(formData);
      handleClose();
      await loadData();
      alert('新增成功！');
    } catch (error) {
      alert('新增失败');
    }
  };

  const columns: (keyof Gym)[] = ["id", "name", "location"]

  return (
    <Box sx={{ p: 3 }}>
      {/* 顶部操作区 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          新增 Gym
        </Button>
      </Box>

      {/* 表格区域 */}
      <BasicTable columns={columns} rows={gyms} />

      {/* 弹窗区域 (Dialog) */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>新增健身房</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="名称"
              name="name" // 必须对应 Gym 接口的字段名
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="位置"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">提交</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

