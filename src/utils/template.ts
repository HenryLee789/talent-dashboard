import * as XLSX from "xlsx";
import { STANDARD_FIELD_ALIASES, STANDARD_FIELDS } from "./fieldMapping";

const TEMPLATE_FILE_NAME = "关键人才花名册模板.xlsx";

const exampleRows = [
  {
    姓名: "张三（示例，请删除后填写真实数据）",
    性别: "男",
    年龄: 34,
    出生日期: "1992-03-15",
    部门: "战略发展部",
    岗位: "部门经理",
    职级: "M3",
    学历: "硕士",
    入职日期: "2018-07-01",
    任职年限: 8,
    绩效等级: "A/优",
    是否关键人才: "是",
    人才分类: "核心人才",
    是否有继任者: "有继任",
    继任者姓名: "李四",
    继任风险: "有继任",
    离职风险: "低",
    发展潜力: "高",
    培训状态: "已完成",
    备注: "示例数据，请勿直接作为正式员工数据导入",
  },
  {
    姓名: "王五（示例，请删除后填写真实数据）",
    性别: "女",
    年龄: 39,
    出生日期: "1987-11-20",
    部门: "运营管理部",
    岗位: "高级经理",
    职级: "M4",
    学历: "本科",
    入职日期: "2016-04-10",
    任职年限: 10,
    绩效等级: "B/良",
    是否关键人才: "Y",
    人才分类: "中坚人才",
    是否有继任者: "需培养",
    继任者姓名: "",
    继任风险: "需培养",
    离职风险: "中",
    发展潜力: "中",
    培训状态: "培养中",
    备注: "示例数据，请勿直接作为正式员工数据导入",
  },
];

function makeRosterTemplateSheet() {
  const sheet = XLSX.utils.aoa_to_sheet([STANDARD_FIELDS]);

  sheet["!cols"] = STANDARD_FIELDS.map((field) => ({
    wch: Math.max(12, field.length * 2 + 4),
  }));

  sheet["!freeze"] = { xSplit: 0, ySplit: 1 };

  return sheet;
}

function makeExampleSheet() {
  const sheet = XLSX.utils.json_to_sheet(exampleRows, {
    header: STANDARD_FIELDS,
  });

  sheet["!cols"] = STANDARD_FIELDS.map((field) => ({
    wch: Math.max(14, field.length * 2 + 6),
  }));

  return sheet;
}

function makeInstructionSheet() {
  const aliasRows = Object.entries(STANDARD_FIELD_ALIASES).map(
    ([standardField, aliases]) => [standardField, aliases.join("、")],
  );
  const rows = [
    ["关键人才花名册模板填写说明", ""],
    ["1", "第一行必须是字段名，请不要在字段名前增加标题行或空行。"],
    ["2", "系统默认读取第一个 Sheet，请在“花名册”Sheet 中填写正式数据。"],
    ["3", "字段名可以使用别名，系统会自动映射为标准字段。"],
    ["4", "缺少字段不会阻断导入，但会影响对应图表、风险预警和分析报告。"],
    ["5", "“填写示例”Sheet 仅用于参考，请不要把示例人员作为正式数据保留。"],
    ["", ""],
    ["标准字段", "支持字段别名"],
    ...aliasRows,
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);

  sheet["!cols"] = [{ wch: 18 }, { wch: 90 }];

  return sheet;
}

export function exportRosterTemplate() {
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, makeRosterTemplateSheet(), "花名册");
  XLSX.utils.book_append_sheet(workbook, makeExampleSheet(), "填写示例");
  XLSX.utils.book_append_sheet(workbook, makeInstructionSheet(), "填写说明");

  workbook.Props = {
    Title: "关键人才花名册模板",
    Subject: "关键人才管理数据看板 Excel 导入模板",
    Author: "关键人才管理数据看板",
  };

  XLSX.writeFile(workbook, TEMPLATE_FILE_NAME);
}
