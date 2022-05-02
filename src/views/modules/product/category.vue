<template>
  <div>
    <el-tree
      :data="dataList"
      :expand-on-click-node="false"
      :show-checkbox="true"
      node-key="catId"
      ref="tree"
      :props="defaultProps"
      :check-strictly="true"
      @node-click="handleNodeClick" @check="handleCheck">
    <span class="mall-category-tree-node" slot-scope="{node,data}">
      <span>{{ node.label }}</span>
      <span>
        <el-button v-if="node.level<=2" type="text" size="mini" @click="()=>append(node,data)">添加节点</el-button>
        <el-button v-if="node.level<=2" type="text" size="mini" @click="()=>edit(node,data)">修改</el-button>
        <el-button v-if="node.childNodes.length===0" type="text" size="mini"
                   @click="()=>removeMultiple()">删除</el-button>
      </span>
    </span>
    </el-tree>
    <el-dialog
      :visible="dialogInfo.visible"
      width="30%">
      <div slot="title"><h2>添加</h2></div>
      <div>
        <el-form v-model="newCategory" :inline="false">
          <el-form-item label="级别" label-width="40px">
            <div>{{ newCategory.catLevel }}</div>
          </el-form-item>
          <el-form-item label="图标">
            <div>
              <el-upload action=""></el-upload>
            </div>
          </el-form-item>
          <el-form-item label="名字">
            <el-input v-model="newCategory.name" maxlength="12" label-width="40px"></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <div>
              <el-switch v-model="newCategory.showStatus===0"
                         active-value="0"
                         inactive-value="1"
              ></el-switch>
            </div>
          </el-form-item>

        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogInfo.visible=false ">取 消</el-button>
        <el-button type="primary" @click="submitAppend">确 定</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
export default {
  name: 'category',
  components: {},
  data () {
    return {
      dataList: [],
      dialogInfo: {visible: false},
      newCategory: {
        catId: null,
        catLevel: null,
        icon: null,
        name: null,
        parentCid: 0,
        showStatus: 0
      },
      dataListLoading: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  methods: {
    handleNodeClick (menu, node, nodeC) {
    },
    handleCheck (checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKeys) {

    },
    getCategories () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl('/product/category/list'),
        method: 'get'
      }).then((res) => {
        console.log(res)
        if (res.status === 200 && res.data.code === 0) {
          this.dataList = res.data.data
        }
      })
    },
    append (node, data) {
      this.dialogInfo.visible = true
      this.newCategory.parentCid = data.parentCid
      this.newCategory.showStatus = data.showStatus
      console.log(data.showStatus)
      this.newCategory.catLevel = data.catLevel
    },
    edit (node, data) {
    },
    submitAppend () {
      console.log(this.newCategory)
      this.$http({
        url: this.$http.adornUrl('/product/category/save'),
        method: 'post',
        data: this.$http.adornData(this.newCategory, false, 'json')
      }).then(({data}) => {
        if (data.code === 0) {
          alert(data.msg)
        } else {
          alert(data.msg)
        }
      }).final(() => {
        this.dialogInfo.visible = false
      })
    },
    removeMultiple () {
      const nodes = this.$refs.tree.getCheckedNodes()
      const ids = []
      for (let n of nodes) {
        ids.push(n.catId)
      }
      this.$http({
        url: this.$http.adornUrl('/product/category/delete'),
        method: 'delete',
        data: this.$http.adornData(ids, false, 'json')
      }).then((res) => {
        if (res.status === 200 && res.data.code === 0) {
          for (const n of nodes) {
            this.$refs.tree.remove(n)
          }
          alert('删除成功')
        }
      })
    }
  },
  activated () {
    this.getCategories()
  },
  mounted () {

  }
}
</script>

<style scoped>
.el-input {
  width: 200px;
}
</style>
