# Field Mapping

The app reads the first row of the first Excel sheet as field headers and maps them to standard fields automatically. Header names are trimmed, repeated spaces are collapsed, trailing colons are removed, and matching is case-insensitive.

If multiple source headers map to the same standard field, the app uses the first matched header and marks the others as unmapped.

## Standard Fields and Common Aliases

| Standard field | Common aliases |
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

| Missing field | Possible impact |
| --- | --- |
| 性别 | Male/female ratio |
| 年龄, 出生日期 | Average age, under-35 ratio, age distribution |
| 学历 | Master-degree-and-above ratio, education distribution |
| 入职日期, 任职年限 | Average tenure, tenure distribution |
| 绩效等级 | Performance chart |
| 是否关键人才 | Key talent count |
| 人才分类 | Talent matrix |
| 是否有继任者, 继任风险 | Succession risk |

## Missing-Field Principles

- Missing fields do not block import.
- The app does not fabricate data.
- If a value can be derived from another field, the app uses that field where possible, such as deriving age from birth date or tenure from hire date.
- Metrics, charts, or report sections that cannot be derived show empty states or missing-field notes.
- Exported files reuse the current missing-field notes.
