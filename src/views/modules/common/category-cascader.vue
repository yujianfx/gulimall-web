<template>
  <div>
    <el-cascader
      filterable
      clearable
      placeholder="试试搜索：手机"
      v-model="paths"
      :options="categorys"
      :props="setting"
    ></el-cascader>
  </div>
</template>
<script>
export default {
  components: {},
  props: {
    catelogPath: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      setting: {
        value: 'catId',
        label: 'name',
        children: 'children'
      },
      categorys: [],
      paths: this.catelogPath
    }
  },
  watch: {
    catelogPath (v) {
      this.paths = this.catelogPath
    },
    paths (v) {
      this.$emit('update:catelogPath', v)
      // this.PubSub.publish('catPath', v)
    }
  },
  methods: {
    getCategorys () {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/'),
        method: 'get'
      }).then(({data}) => {
        this.categorys = data.data
      })
    }
  },
  created () {
    this.getCategorys()
  }
}
</script>
<style scoped>
</style>
