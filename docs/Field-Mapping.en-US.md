English | [简体中文](./字段映射说明.md)

# Field Mapping

Talent Management Dashboard reads the first row of the first sheet in the Excel roster as field headers and maps those headers to the built-in standard field dictionary. Before matching, the system trims leading and trailing spaces, collapses repeated spaces, removes trailing colons, and matches field names case-insensitively.

If multiple source headers map to the same standard field, the system uses the first matched header and marks the remaining duplicate headers as unmapped.

## Standard Fields and Aliases

| Standard field | Supported aliases |
| --- | --- |
| 姓名 | 姓名, 员工姓名, 人员姓名, 员工, Name, Employee Name |
| 性别 | 性别, Gender, Sex |
| 年龄 | 年龄, Age |
| 出生日期 | 出生日期, 生日, Birth Date, Birthday |
| 部门 | 部门, 组织, 所属部门, Department, Org, Organization |
| 岗位 | 岗位, 职位, 职务, Position, Job Title, Role |
| 职级 | 职级, 等级, Level, Grade |
| 学历 | 学历, 最高学历, Education, Degree |
| 入职日期 | 入职日期, 入司日期, 入职时间, Hire Date, Join Date |
| 任职年限 | 任职年限, 司龄, 工作年限, Tenure, Years of Service |
| 绩效等级 | 绩效, 绩效等级, 绩效结果, Performance, Performance Rating |
| 是否关键人才 | 是否关键人才, 关键人才, Key Talent, Core Talent |
| 人才分类 | 人才分类, 人才九宫格, 九宫格, Talent Category, Talent Matrix |
| 是否有继任者 | 是否有继任者, 继任者, 有无继任, Successor, Has Successor |
| 继任者姓名 | 继任者姓名, 继任人, 继任者, Successor Name |
| 继任风险 | 继任风险, 继任状态, Successor Risk, Succession Risk |
| 离职风险 | 离职风险, 流失风险, Attrition Risk, Turnover Risk |
| 发展潜力 | 发展潜力, 潜力, Potential |
| 培训状态 | 培训状态, 培养状态, Training Status, Development Status |
| 备注 | 备注, 说明, Remark, Notes |

## Impact of Missing Fields

| Missing field | Affected analysis |
| --- | --- |
| 性别 | Male/female ratio |
| 年龄, 出生日期 | Average age, under-35 ratio, and age distribution. If either field is provided, the related analysis can continue. |
| 学历 | Master-degree-and-above ratio and education distribution |
| 入职日期, 任职年限 | Average tenure and tenure distribution. If either field is provided, the related analysis can continue. |
| 绩效等级 | Performance distribution chart |
| 是否关键人才 | Key talent count |
| 人才分类 | Talent matrix |
| 是否有继任者, 继任风险 | Succession risk |

## Handling Principles

- Missing fields do not block Excel roster import.
- The system does not fabricate data.
- Metrics that can be derived from other fields continue to work, such as age from `出生日期` and tenure from `入职日期`.
- Metrics, charts, or report sections that cannot be calculated show empty states or missing field notes.
- Exported files reuse the current missing field notes and data quality notes.
