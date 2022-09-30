<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.key" clearable placeholder="参数名"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button :disabled="dataListSelections.length <= 0" type="danger" @click="deleteHandle()">批量删除</el-button>
        <!--        <el-button v-if="isAuth('product:brand:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>-->
        <!--        <el-button v-if="isAuth('product:brand:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>-->
      </el-form-item>
    </el-form>
    <el-table
      v-loading="dataListLoading"
      :data="dataList"
      border
      style="width: 100%;"
      @selection-change="selectionChangeHandle">
      <el-table-column
        align="center"
        header-align="center"
        type="selection"
        width="50">
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="品牌id"
        prop="brandId">
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="品牌名"
        prop="name">
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="品牌logo地址"
        prop="logo">
        <template slot-scope="scope">
          <img :src="scope.row.logo" alt="加载失败" style="object-fit: scale-down;height: 80px;width: 100px"/>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="介绍"
        prop="descript">
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="显示状态"
        prop="showStatus">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.showStatus" :active-value='0' :inactive-value='1' inactive-color="red"
                     @change="showStatusChangeHandle(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="检索首字母"
        prop="firstLetter">
      </el-table-column>
      <el-table-column
        align="center"
        header-align="center"
        label="排序"
        prop="sort">
      </el-table-column>
      <el-table-column
        align="center"
        fixed="right"
        header-align="center"
        label="操作"
        width="150">
        <template slot-scope="scope">
          <el-button size="small" type="text" @click="relationHandle(scope.row.brandId)">关联</el-button>
          <el-button size="small" type="text" @click="addOrUpdateHandle(scope.row.brandId)">修改</el-button>
          <el-button size="small" type="text" @click="deleteHandle(scope.row.brandId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="pageIndex"
      :page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
    <relation-update v-if="relationVisible" ref="relationUpdate" @refreshData="getDataList"></relation-update>
  </div>
</template>

<script>
import AddOrUpdate from './brand-add-or-update'
import RelationUpdate from './brand-category-relation'

export default {
  data () {
    return {
      dataForm: {
        key: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      relationVisible: false
    }
  },
  components: {
    AddOrUpdate,
    RelationUpdate
  },
  activated () {
    this.getDataList()
  },
  methods: {
    relationHandle (bid) {
      this.relationVisible = true
      this.$nextTick(() => {
        this.$refs.relationUpdate.init(bid)
      })
    },
    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/product/brand/list'),
        method: 'get',
        params: this.$http.adornParams({
          'page': this.pageIndex,
          'limit': this.pageSize,
          'key': this.dataForm.key
        })
      }).then(({data}) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list
          this.totalPage = data.page.totalCount
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },

    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },

    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },

    selectionChangeHandle (val) {
      this.dataListSelections = val
    },

    addOrUpdateHandle (id) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id)
      })
    },

    deleteHandle (id) {
      var ids = id ? [id] : this.dataListSelections.map(item => {
        return item.brandId
      })
      this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/brand/delete'),
          method: 'DELETE',
          data: this.$http.adornData(ids, false)
        }).then(({data}) => {
          if (data && data.code === 0) {
            this.$message({
              message: '操作成功',
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.getDataList()
              }
            })
          } else {
            this.$message.error(data.msg)
          }
        })
      })
    },

    showStatusChangeHandle (val) {
      let {brandId, showStatus} = val
      this.$http({
        url: this.$http.adornUrl('/product/brand/update'),
        method: 'PUT',
        data: this.$http.adornData({brandId, showStatus}, false, 'json')
      }).then((res) => {
        console.log(res)
        this.$message.success(res.data.msg)
      })
    }
  }
}
</script>
