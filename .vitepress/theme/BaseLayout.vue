<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { NDatePicker, NConfigProvider, darkTheme } from 'naive-ui'
import dayjs from 'dayjs'
const { Layout } = DefaultTheme
const router = useRouter();
const data = useData();
const timestamp = ref(null);
const tweetDate:Array<String> = data?.theme?.value?.sidebar?.find(x => x.text === 'Twitter')?.items?.map(e => {
  const matchDate = e.link.match(/Twitter\/(\d{4}-\d{2}-\d{2})\.md/);
  if (matchDate) return matchDate[1];
  return '';
}) ?? [];

const goToPath = () => timestamp.value ? router.go(`/Hrsw-Twlog/Twitter/${timestamp.value}.html`) : null;
const disableDate = (date: number) => !tweetDate.some(x => x === dayjs(date).format('YYYY-MM-DD'));
</script>

<template>
  <Layout>
    <template #sidebar-nav-before>
      <div class="searchColumn">
        <n-config-provider :theme="data.isDark.value === true ? darkTheme : null">
          <n-date-picker v-model:formatted-value="timestamp" type="date" placeholder="Search date"
            value-format="yyyy-MM-dd" :is-date-disabled="disableDate" :actions="['clear']" clearable />
        </n-config-provider>
        <button class="searchButton" @click="goToPath()">
          <svg width="20" height="20" viewBox="0 0 20 20" class="searchIcon">
            <path
              d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
              stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
            </path>
          </svg>
        </button>
      </div>
    </template>
  </Layout>
</template>
<style>
.searchColumn {
  display: flex;
  padding-top: 15px;
}

.searchColumn .searchButton {
  padding-left: 10px;
}

.searchColumn .searchButton .searchIcon {
  width: 15px;
  height: 15px;
}
</style>